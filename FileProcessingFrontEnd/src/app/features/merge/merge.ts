import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

import { HttpEventType } from '@angular/common/http';

import { DocumentUpload } 
from '../../shared/components/document-upload/document-upload';

import { FileList } 
from '../../shared/components/file-list/file-list';

import { ResultCard } 
from '../../shared/components/result-card/result-card';

import { FileService } from '../../core/services/file';
import { ResponseDto } from '../../models/response-dto';
import { environment } from '../../../enviornment/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-merge',

  standalone:true,

  imports:[
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,

    DocumentUpload,
    FileList,
    ResultCard,
    
  ],

  templateUrl:'./merge.html',

  styleUrl:'./merge.css'
})
export class Merge {


  constructor(
    private fileService: FileService,
      private cdr: ChangeDetectorRef
  ){}



  selectedFiles: File[] = [];


  loading = false;


  uploadProgress = 0;


  response?: ResponseDto;




  onFilesSelected(files: File[]){

    this.selectedFiles = files;

  }




  removeFile(index:number){

    this.selectedFiles.splice(index,1);

  }



mergeDocuments(){


  if(this.selectedFiles.length === 0){
    return;
  }


  this.loading = true;

  this.uploadProgress = 0;


  this.fileService
    .merge(this.selectedFiles)
    .subscribe({

      next:(event)=>{


        console.log("MERGE EVENT:", event);



        switch(event.type){



          case HttpEventType.UploadProgress:


            if(event.total){

              this.uploadProgress =
              Math.round(
                (event.loaded * 100) /
                event.total
              );

            }


            break;



          case HttpEventType.Response:


            console.log("FINAL RESPONSE:", event.body);


this.response = event.body!;
this.uploadProgress = 100;
this.loading = false;

this.cdr.detectChanges();


console.log(
 "loading:",
 this.loading,
 "progress:",
 this.uploadProgress
);



            break;



        }


      },



      error:(err)=>{


        console.log("MERGE ERROR",err);


        this.loading=false;


      }


    });


}



  downloadFile(){

    if(!this.response){
        return;
    }


    const url =
    `${environment.apiBaseUrl}/download/${this.response.documentName}`;


    window.open(url, '_blank');

}


}