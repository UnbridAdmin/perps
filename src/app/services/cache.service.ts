import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
    set(key: string, value: any) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    get(key: string) {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    remove(key: string) {
        sessionStorage.removeItem(key);
    }

    clear() {
        sessionStorage.clear();
    }
}