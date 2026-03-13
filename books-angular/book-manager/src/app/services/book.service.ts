import { Injectable, signal } from '@angular/core';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books = signal<Book[]>([
    {
      id: '1',
      title: 'Amadeus: A Play',
      author: 'Peter Shaffer',
      coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
      publishedYear: 1979
    },
    {
      id: '2',
      title: 'Annotated Alice',
      author: 'Lewis Carroll',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      publishedYear: 1960
    },
    {
      id: '3',
      title: 'Applied Numerical Analysis',
      author: 'Curtis F. Gerald',
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
      publishedYear: 1989
    }
  ]);

  getBooks() {
    return this.books.asReadonly();
  }

  addBook(book: Omit<Book, 'id'>) {
    const newBook: Book = {
      ...book,
      id: Date.now().toString()
    };
    this.books.update(books => [...books, newBook]);
  }

  updateBook(id: string, book: Partial<Book>) {
    this.books.update(books =>
      books.map(b => b.id === id ? { ...b, ...book } : b)
    );
  }

  deleteBook(id: string) {
    this.books.update(books => books.filter(b => b.id !== id));
  }

  getBookById(id: string) {
    return this.books().find(b => b.id === id);
  }
}
