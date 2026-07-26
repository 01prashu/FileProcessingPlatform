import { Injectable } from '@angular/core';
import { HttpClient,HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../enviornment/environment'
import { ResponseDto } from '../../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class FileService {

    constructor(private http:HttpClient){}

    merge(files:File[]):Observable<HttpEvent<ResponseDto>>{

        const formData = new FormData();

        files.forEach(file=>{

            formData.append("file",file);

        });

        return this.http.post<ResponseDto>(

            `${environment.apiBaseUrl}/merge`,

            formData,

            {

                observe:'events',

                reportProgress:true

            }

        );

    }
    download(documentName: string) {

    return this.http.get(

        `${environment.apiBaseUrl}/download/${documentName}`,

        {

            responseType: 'blob'

        }

    );

}
split(file: File, startPageNo: number, lastPageNo: number) {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("startPageNo", startPageNo.toString());
    formData.append("lastPageNo", lastPageNo.toString());

    return this.http.post<ResponseDto>(
        `${environment.apiBaseUrl}/split`,
        formData,
        {
            observe: "events",
            reportProgress: true
        }
    );
}

}