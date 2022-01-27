import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';


@Injectable({providedIn:'root'})

export class AccessProviders{
    
    server: string = 'https://mobile1.vci.co.id/vci_mobile_api/index.php/sales_partnership/';

    constructor(
        public http: HttpClient
    ){ }

    postData(body: any, file: any){
        let headers = new HttpHeaders({
            'Content-Type': 'application/json; charset=UTF-8'
        });

        let options = {
            headers: headers
        }

        return this.http.post(this.server + file, JSON.stringify(body),options)
        .timeout(59000)
        .map(res => res)
    }


}