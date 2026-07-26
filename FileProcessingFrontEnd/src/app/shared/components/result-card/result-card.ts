import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './result-card.html',
  styleUrl: './result-card.css'
})
export class ResultCard {

  @Input()
  documentName = '';

  @Output()
  download = new EventEmitter<void>();

  downloadFile(): void {
    this.download.emit();
  }

}