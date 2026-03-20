import { RouterModule } from '@angular/router';
import {
    CUSTOM_ELEMENTS_SCHEMA,
    Component,
    NO_ERRORS_SCHEMA,
    NgModule,
} from '@angular/core';
import { AgilToastComponent } from './toaster/agil-toast/agil-toast.component';

const APP_CONTAINERS = [];
@NgModule({
    imports: [
    ],
    declarations: [
        AgilToastComponent,

    ],
    exports: [
        AgilToastComponent,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule { }
