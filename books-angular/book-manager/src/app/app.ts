import { Component } from '@angular/core';
import { BookListComponent } from './components/book-list/book-list.component';

@Component({
  selector: 'app-root',
  imports: [BookListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
