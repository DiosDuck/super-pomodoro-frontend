import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
    getJsonParsed(key: string): any
    {
        let rawData = this.get(key);
        if (!rawData) {
            return null;
        }

        let obj = JSON.parse(rawData);
        return obj;
    }

    parseAndSet(key: string, value: any): void
    {
        let rawData = JSON.stringify(value);
        this.set(key, rawData);
    }

    get(key: string): string | null
    {
        return localStorage.getItem(key);
    }

    set(key: string, value: string): void
    {
        localStorage.setItem(key, value);
    }

    remove(key: string): void
    {
        localStorage.removeItem(key);
    }
}