import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA,
    NgModule,
} from '@angular/core';
import { AgilToastComponent } from './toaster/agil-toast/agil-toast.component';

const APP_CONTAINERS = [];
@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        AgilToastComponent,
    ],
    exports: [
        AgilToastComponent,
        CommonModule,
        FormsModule
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule { }
