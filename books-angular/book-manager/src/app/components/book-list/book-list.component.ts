import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {
  private bookService = inject(BookService);
  
  books = this.bookService.getBooks();
  searchQuery = signal('');
  selectedLetter = signal('ALL');
  viewMode = signal<'cover' | 'title'>('cover');
  showAddModal = signal(false);
  showEditModal = signal(false);
  selectedBook = signal<Book | null>(null);

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  filteredBooks = computed(() => {
    let filtered = this.books();
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    const letter = this.selectedLetter();
    if (letter !== 'ALL') {
      filtered = filtered.filter(book => {
        const firstChar = book.title.charAt(0).toUpperCase();
        if (letter === '#') {
          return !/[A-Z]/.test(firstChar);
        }
        return firstChar === letter;
      });
    }

    return filtered;
  });

  groupedBooks = computed(() => {
    const books = this.filteredBooks();
    const grouped = new Map<string, Book[]>();

    books.forEach(book => {
      const firstChar = book.title.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      
      if (!grouped.has(letter)) {
        grouped.set(letter, []);
      }
      grouped.get(letter)!.push(book);
    });

    return Array.from(grouped.entries()).sort((a, b) => {
      if (a[0] === '#') return 1;
      if (b[0] === '#') return -1;
      return a[0].localeCompare(b[0]);
    });
  });

  newBook = signal({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    publishedYear: new Date().getFullYear()
  });

  editBook = signal({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    publishedYear: new Date().getFullYear()
  });

  selectLetter(letter: string) {
    this.selectedLetter.set(letter);
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.resetNewBook();
  }

  openEditModal(book: Book) {
    this.selectedBook.set(book);
    this.editBook.set({
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl || '',
      description: book.description || '',
      publishedYear: book.publishedYear || new Date().getFullYear()
    });
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedBook.set(null);
  }

  addBook() {
    const book = this.newBook();
    if (book.title && book.author) {
      this.bookService.addBook(book);
      this.closeAddModal();
    }
  }

  updateBook() {
    const book = this.selectedBook();
    if (book) {
      this.bookService.updateBook(book.id, this.editBook());
      this.closeEditModal();
    }
  }

  deleteBook(id: string) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id);
    }
  }

  resetNewBook() {
    this.newBook.set({
      title: '',
      author: '',
      coverUrl: '',
      description: '',
      publishedYear: new Date().getFullYear()
    });
  }
}
