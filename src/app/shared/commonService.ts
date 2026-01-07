import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class CommonService {
    signatureProcessing: EventEmitter<any> = new EventEmitter();
    updateUserAddress: EventEmitter<any> = new EventEmitter();
    logoutBalance: EventEmitter<any> = new EventEmitter();

    generateUniqueUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    saveAccountAddress(address: string) {
        if (address) {
            sessionStorage.setItem('accountAddress', address);
        }
    }

    getAccountAddress() {
        return sessionStorage.getItem('accountAddress');
    }
}