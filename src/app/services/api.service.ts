import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiServices {
    URL_API = environment.apiUrl;
    constructor(private http: HttpClient) { }

    public apiCall(endpoint: any, method: any, data: any) {
        const headers = new HttpHeaders({ "Content-Type": "application/json;", "Accept-Language": "es" });
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', "Accept-Language": "es" }),
            withCredentials: true
        };
        switch (method) {
            case "GET":
                return this.http.get(this.URL_API + endpoint, { headers: headers, params: data, withCredentials: true }).pipe(
                    map((response: any) => {
                        console.log(response)
                        if (response.status != 200) {
                            throw new Error(response.status.toString());
                        }
                        else {
                            return response;
                        }
                    }))
            case "POST":
                return this.http.post(this.URL_API + endpoint, data, httpOptions).pipe(map((response: any) => {
                    console.log(response)
                    if (response.status != 200) {
                        throw new Error(response.status.toString());
                    }
                    else {
                        return response;
                    }
                }));

            case "PUT":
                return this.http.put(this.URL_API + endpoint, data, httpOptions).pipe(map((response: any) => {
                    console.log(response)
                    if (response.status != 200) {
                        throw new Error(response.status.toString());
                    }
                    else {
                        return response;
                    }
                }));

            case "DELETE":
                return this.http.delete(this.URL_API + endpoint, { headers: headers, params: data, withCredentials: true }).pipe(map((response: any) => {
                    console.log(response)
                    if (response.status != 200) {
                        throw new Error(response.status.toString());
                    }
                    else {
                        return response;
                    }
                }));
            default:
                throw new Error(`Método ${method} no soportado`);
        }
    }

    public publicApiCall(endpoint: any, method: any, data: any) {
        const headers = new HttpHeaders({ "Content-Type": "application/json", "Accept-Language": "es" });
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json', "Accept-Language": "es" }),
            withCredentials: true
        };
        switch (method) {
            case "GET":
                return this.http.get(this.URL_API + endpoint, { headers: headers, params: data, withCredentials: true });
            case "POST":
                return this.http.post(this.URL_API + endpoint, data, httpOptions);
        }
        return null;
    }

    public pingApiCall(endpoint: any, method: any, data: any) {
        const headers = new HttpHeaders({ "Content-Type": "application/json;", "Accept-Language": "es" });
        switch (method) {
            case "GET":
                return this.http.get(this.URL_API + endpoint, { headers: headers, params: data, withCredentials: true }).pipe(
                    tap(res => (localStorage["data"] = JSON.stringify(res))),
                    map(res => true, (error: any) => false)
                );
            default:
                throw new Error(`Método ${method} no soportado`);
        }
    }
}
