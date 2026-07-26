import { Component, EventEmitter, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-document-upload',
  standalone:true,
  imports:[
    MatIconModule,
    MatButtonModule
  ],
  templateUrl:'./document-upload.html',
  styleUrl:'./document-upload.css'
})
export class DocumentUpload {


  @Output()
  filesSelected = new EventEmitter<File[]>();
dragging = false;

onDragOver(event: DragEvent) {
  event.preventDefault();
  this.dragging = true;
}

onDragLeave() {
  this.dragging = false;
}

onDrop(event: DragEvent) {
  event.preventDefault();
  this.dragging = false;

  if (event.dataTransfer?.files) {
    this.filesSelected.emit(Array.from(event.dataTransfer.files));
  }
}


  onFilesSelected(event:Event){

    const input = event.target as HTMLInputElement;


    if(input.files){

      this.filesSelected.emit(
        Array.from(input.files)
      );

    }

  }


}