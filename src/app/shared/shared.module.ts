import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
    NgModule,
} from '@angular/core';
import { AgilToastComponent } from './toaster/agil-toast/agil-toast.component';
import { NgApexchartsModule } from 'ng-apexcharts';

const APP_CONTAINERS = [];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgApexchartsModule
    ],
    declarations: [
        AgilToastComponent,
    ],
    exports: [
        AgilToastComponent,
        CommonModule,
        FormsModule,
        NgApexchartsModule
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule { }
