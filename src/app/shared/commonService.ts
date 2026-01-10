import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable()
export class CommonService {
    signatureProcessing: EventEmitter<any> = new EventEmitter();
    updateUserAddress: EventEmitter<any> = new EventEmitter();
    logoutBalance: EventEmitter<any> = new EventEmitter();
    accountChanging: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    validChains: number[] = environment.VALIDCHAINS;
    nameChains: any = environment.NAMECHAINS;

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

    validateChains(chainID: number): boolean {
        // Verificar si el chainID está presente en el arreglo de cadenas válidas
        return this.validChains.includes(chainID);
    }

    getNameByChainId(chainId: number): string | undefined {
        const chain = this.nameChains.find((item: any) => item.chainId === chainId);
        return chain ? chain.name : undefined;
    }
}