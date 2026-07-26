import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { HttpEventType } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { FileService } from '../../core/services/file';
import { ResponseDto } from '../../models/response-dto';
import { environment } from '../../../enviornment/environment';
import { ResultCard }
from '../../shared/components/result-card/result-card';
//import { DocumentUpload } from '../../shared/components/document-upload/document-upload';
@Component({
  selector: 'app-split',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
ResultCard,

  ],
  templateUrl: './split.html',
  styleUrl: './split.css'
})
export class Split {

  constructor(
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) { console.log("Split Component Loaded"); }

  selectedFile?: File;

  startPageNo = 1;

  lastPageNo = 1;

  uploadProgress = 0;

  loading = false;

  response?: ResponseDto;

  onFileSelected(event: Event) {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      this.selectedFile = input.files[0];

    }

  }

  splitDocument() {
    console.log("Split method called");
    if (!this.selectedFile) {
      return;
    }

    this.loading = true;

    this.fileService
      .split(
        this.selectedFile,
        this.startPageNo,
        this.lastPageNo
      )
      .subscribe({

        next: (event) => {

          console.log("EVENT RECEIVED:", event);

          switch (event.type) {

            case HttpEventType.Sent:
              console.log("Request Sent");
              break;

            case HttpEventType.UploadProgress:

              console.log("Upload Progress", event.loaded, event.total);

              if (event.total) {
                this.uploadProgress =
                  Math.round((event.loaded * 100) / event.total);
              }

              break;

            case HttpEventType.Response:

              console.log("FINAL RESPONSE");
              console.log(event.body);

              setTimeout(() => {

                this.response = event.body!;

                this.uploadProgress = 100;

                this.loading = false;

                this.cd.detectChanges();

                this.snackBar.open(
                  "Split Successful 🎉",
                  "OK",
                  {
                    duration: 3000
                  }
                );

              });

              break;
          }

        },

        error: (err) => {

          this.loading = false;

          this.snackBar.open(
            err.error.remark,
            "Close",
            {
              duration: 3000
            }
          );

        }

      });

  }

  download() {

    if (!this.response) {
      return;
    }

    const downloadUrl =
      `${environment.apiBaseUrl}/download/${this.response.documentName}`;

    window.open(downloadUrl, '_blank');

  }

  pageError = '';

validatePageRange(){

    this.pageError = '';


    if(this.startPageNo < 1){

        this.pageError = 'Start page must be greater than 0';

        return;

    }


    if(this.lastPageNo < 1){

        this.pageError = 'End page must be greater than 0';

        return;

    }


    if(this.startPageNo > this.lastPageNo){

        this.pageError = 
        'Start page cannot be greater than end page';

        return;

    }
    

}
removeFile(){

    this.selectedFile = undefined;

    this.startPageNo = 1;

    this.lastPageNo = 1;

    this.pageError = '';

    this.response = undefined;

}
}