import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;
  private books = signal<Book[]>([]);

  constructor(private http: HttpClient) {
    this.loadBooks();
  }

  getBooks() {
    return this.books.asReadonly();
  }

  loadBooks(): void {
    this.http.get<Book[]>(this.apiUrl).subscribe({
      next: (books) => this.books.set(books),
      error: (error) => console.error('Error loading books:', error)
    });
  }

  addBook(book: Omit<Book, 'id'>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book).pipe(
      tap(newBook => this.books.update(books => [...books, newBook]))
    );
  }

  updateBook(id: number, book: Partial<Book>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { ...book, id }).pipe(
      tap(() => this.books.update(books =>
        books.map(b => b.id === id ? { ...b, ...book } : b)
      ))
    );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.books.update(books => books.filter(b => b.id !== id)))
    );
  }

  getBookById(id: number): Book | undefined {
    return this.books().find(b => b.id === id);
  }

  uploadImage(id: number, file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload-image/${id}`, formData).pipe(
      tap(response => {
        this.books.update(books =>
          books.map(b => b.id === id ? { ...b, imageUrl: response.imageUrl } : b)
        );
      })
    );
  }
}
