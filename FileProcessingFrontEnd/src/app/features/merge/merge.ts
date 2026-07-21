import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../core/services/file';
import { ResponseDto } from '../../models/response-dto';
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { HttpEventType } from '@angular/common/http';
@Component({
  selector: 'app-merge',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './merge.html',
  styleUrl: './merge.css'
})
export class Merge {
  uploadProgress: number = 0;

  loading = false;

  response?: ResponseDto;
  constructor(

    private fileService: FileService

  ) { }
  selectedFiles: File[] = [];

  onFilesSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }

  }
  removeFile(index: number): void {

    this.selectedFiles.splice(index, 1);

  }
  mergeDocuments() {

    this.loading = true;

    this.fileService.merge(this.selectedFiles)

      .subscribe({

        next: (event) => {

          if (event.type === HttpEventType.UploadProgress) {

            if (event.total) {

              this.uploadProgress = Math.round(

                event.loaded * 100 / event.total

              );

            }

          }

          if (event.type === HttpEventType.Response) {

            this.response = event.body!;

            this.loading = false;

          }

        },

        error: (err) => {

          this.loading = false;

          alert(err.error.remark);

        }

      });

  }
downloadFile() {

  if (!this.response) {
    return;
  }

  this.fileService.download(this.response.documentName)
    .subscribe({

      next: (blob: Blob) => {

        const fileURL = URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = fileURL;
        link.download = this.response!.documentName;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(fileURL);

      },

      error: (err) => {

        console.error(err);

      }

    });

}

}