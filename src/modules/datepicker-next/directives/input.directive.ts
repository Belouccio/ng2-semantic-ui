
import { Directive, Host, Input, ElementRef, HostBinding, HostListener, Renderer2, OnInit, OnChanges } from "@angular/core";
import { DateUtil, DatePrecision } from "../../../misc/util/internal";
import { SuiLocalizationService } from "../../../behaviors/localization/internal";
import { PopupTrigger } from "../../popup/internal";
import { SuiDatepickerNextDirective, SuiDatepickerNextDirectiveValueAccessor } from "./datepicker.directive";
import { InternalDateParser, DateParser } from "../classes/date-parser";
import { MaskedTextChangedListener, Notation, AffinityCalculation, AffinityCalculationStrategy } from "ts-input-mask";
import * as bowser from "bowser";

import "../helpers/is-webview";
import * as isUAWebView from "is-ua-webview";
const isWebView = isUAWebView["default"] || isUAWebView;

export class InputMaskOptions {
    constructor(
      public readonly affineFormats:ReadonlyArray<String> = [],
      public readonly customNotations:ReadonlyArray<Notation> = [],
      public readonly affinityCalculationStrategy:AffinityCalculation =
        new AffinityCalculation(AffinityCalculationStrategy.WHOLE_STRING),
      public readonly autocomplete:boolean = false
    ) {}
}

const DATEPICKER_MASKS = {
    time: "[09]{:}[09]",
    datetime: "[09]{.}[09]{.}[0000] [09]{:}[09]",
    date: "[09]{.}[09]{.}[0000]",
    month: "[aaaAAAAA] [0000]",
    year: "[0000]"
};

@Directive({
    selector: "input[suiDatepickerNext]"
})
export class SuiDatepickerNextInputDirective implements OnInit, MaskedTextChangedListener.ValueListener {
    private _useNativeOnMobile:boolean;

    @Input("pickerUseNativeOnMobile")
    public get useNativeOnMobile():boolean {
        return this._useNativeOnMobile;
    }

    public set useNativeOnMobile(fallback:boolean) {
        this._useNativeOnMobile = fallback;
        const isOnMobile = bowser.mobile || bowser.tablet || isWebView(navigator.userAgent);
        this.fallbackActive = this.useNativeOnMobile && isOnMobile;
    }

    private _fallbackActive:boolean;

    public get fallbackActive():boolean {
        return this._fallbackActive;
    }

    public set fallbackActive(active:boolean) {
        this._fallbackActive = active;
        // If the fallback is active, then the trigger must be manual so the datepicker never opens.
        this.datepicker.popup.config.trigger = this.fallbackActive ? PopupTrigger.Manual : PopupTrigger.Focus;
        // Update the input value (this will insert the `T` as required).
        this.updateValue(this.selectedDateString);
    }

    public get parser():DateParser {
        if (this.fallbackActive) {
            return new InternalDateParser(this.datepicker.mode, this.datepicker.localeValues);
        }
        return new DateParser(this.datepicker.localeValues.formats[this.datepicker.mode], this.datepicker.localeValues);
    }

    private _currentInputValue:string | undefined;
    private _lastUpdateTyped:boolean;

    public get selectedDateString():string | undefined {
        if (this.datepicker.selectedDate) {
            return this.parser.format(this.datepicker.selectedDate);
        }
    }

    @HostBinding("attr.type")
    public get type():string {
        if (this.fallbackActive) {
            return this.datepicker.config.fallback;
        }
        return "text";
    }

    @HostBinding("attr.max")
    public get max():string | undefined {
        if (this.fallbackActive && this.datepicker.maxDate) {
            // Since HTML doesn't use a date object max is somewhat tricky.
            // Our Datepicker will always choose the 1st date on the provided precision,
            // meaning anything below the maxDate will work, hence endOf.
            const max = DateUtil.endOf(this.datepicker.config.precision, DateUtil.clone(this.datepicker.maxDate));
            return this.parser.format(max);
        }
    }

    @HostBinding("attr.min")
    public get min():string | undefined {
        if (this.fallbackActive && this.datepicker.minDate) {
            // Since HTML doesn't use a date object min is somewhat tricky.
            // We use 1 minute before the next date at the configured precision since
            // our Datepicker picks the first available date at that precision.
            const min = DateUtil.clone(this.datepicker.minDate);
            return this.parser.format(min);
        }
    }

    private _maskOptions:InputMaskOptions = new InputMaskOptions();
    @Input("maskOptions") set maskOptions(value:InputMaskOptions) {
        this._maskOptions = value;
    }

    constructor(@Host() public datepicker:SuiDatepickerNextDirective,
                @Host() public valueAccessor:SuiDatepickerNextDirectiveValueAccessor,
                private _renderer:Renderer2,
                private _element:ElementRef,
                localizationService:SuiLocalizationService) {

        this.useNativeOnMobile = true;
        this.fallbackActive = false;

        // Whenever the datepicker value updates, update the input text alongside it.
        this.datepicker.onDateChange.subscribe(({ force }) =>
            this.updateValue(this.selectedDateString, force));

        localizationService.onLanguageUpdate.subscribe(() =>
            this.updateValue(this.selectedDateString));
    }

    public ngOnInit():void {
        this.setupListener(this._element.nativeElement);
    }

    public onTextChanged(
        maskFilled:boolean,
        extractedValue:string,
        formattedText:string
    ):void {
        this._lastUpdateTyped = true;
        this._currentInputValue = extractedValue;
        if (!maskFilled || !extractedValue) {
            // Delete the selected date if no date was entered manually.
            if (this.datepicker.selectedDate !== undefined) {
                this.datepicker.setSelectedDate(undefined);
            }
            return;
        }
        const parsed = this.parser.parse(formattedText, this.datepicker.selectedDate);
        if (!isNaN(parsed.getTime()) && formattedText === this.parser.format(parsed)) {
            return this.datepicker.setSelectedDate(parsed);
        }
        if (this.datepicker.selectedDate !== undefined) {
            this.datepicker.setSelectedDate(undefined);
        }
        this._lastUpdateTyped = false;
    }

    private setupListener(input:HTMLInputElement):void {
        MaskedTextChangedListener.installOn(
            DATEPICKER_MASKS[this.datepicker.mode],
            input,
            this,
            this._maskOptions.affineFormats,
            this._maskOptions.customNotations,
            this._maskOptions.affinityCalculationStrategy,
            this._maskOptions.autocomplete
        );
    }

    private updateValue(value:string | undefined, force:boolean = false):void {
        // Only update the current value if it is different to what it's being updated to.
        // This is so that the editing position isn't changed when manually typing the date.
        if (!this._lastUpdateTyped || force) {
            this._renderer.setProperty(this._element.nativeElement, "value", value || "");
        }

        this._lastUpdateTyped = false;
    }

    @HostListener("focusout")
    public onFocusOut():void {
        this.valueAccessor.onTouched();
    }
}
