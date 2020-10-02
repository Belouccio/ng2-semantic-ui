import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SuiPopupModule } from "../popup/internal";
import { SuiLocalizationModule } from "../../behaviors/localization/internal";
import { SuiUtilityModule } from "../../misc/util/internal";
import { SuiCalendarNextViewTitle } from "./components/calendar-view-title";
import { SuiCalendarNextYearView } from "./views/year-view";
import { SuiCalendarNextMonthView } from "./views/month-view";
import { SuiCalendarNextItem } from "./directives/calendar-item";
import { SuiCalendarNextDateView } from "./views/date-view";
import { SuiDatepickerNext } from "./components/datepicker";
import { SuiCalendarNextHourView } from "./views/hour-view";
import { SuiCalendarNextMinuteView } from "./views/minute-view";
import { SuiDatepickerNextInputDirective } from "./directives/input.directive";
import {
    SuiDatepickerNextDirective, SuiDatepickerNextDirectiveValueAccessor,
    SuiDatepickerNextDirectiveValidator
} from "./directives/datepicker.directive";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SuiPopupModule,
        SuiLocalizationModule,
        SuiUtilityModule
    ],
    declarations: [
        SuiCalendarNextItem,

        SuiCalendarNextViewTitle,
        SuiCalendarNextYearView,
        SuiCalendarNextMonthView,
        SuiCalendarNextDateView,
        SuiCalendarNextHourView,
        SuiCalendarNextMinuteView,

        SuiDatepickerNext,
        SuiDatepickerNextDirective,
        SuiDatepickerNextDirectiveValueAccessor,
        SuiDatepickerNextDirectiveValidator,
        SuiDatepickerNextInputDirective
    ],
    exports: [
        SuiDatepickerNextDirective,
        SuiDatepickerNextDirectiveValueAccessor,
        SuiDatepickerNextDirectiveValidator,
        SuiDatepickerNextInputDirective
    ],
    entryComponents: [
        SuiDatepickerNext
    ]
})
export class SuiDatepickerNextModule {}
