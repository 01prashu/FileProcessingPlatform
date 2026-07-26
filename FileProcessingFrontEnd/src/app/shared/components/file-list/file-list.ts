import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './file-list.html',
  styleUrl: './file-list.css'
})
export class FileList {

  @Input()
  files: File[] = [];

  @Output()
  remove = new EventEmitter<number>();

  removeFile(index: number) {
    this.remove.emit(index);
  }

}