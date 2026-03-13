import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {
  private bookService = inject(BookService);
  environment = environment;
  
  books = this.bookService.getBooks();
  searchQuery = signal('');
  selectedLetter = signal('ALL');
  viewMode = signal<'cover' | 'title'>('cover');
  showAddModal = signal(false);
  showEditModal = signal(false);
  showViewModal = signal(false);
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
    isbn: '',
    publicationDate: new Date().toISOString().split('T')[0],
    imageUrl: ''
  });

  editBook = signal({
    title: '',
    author: '',
    isbn: '',
    publicationDate: new Date().toISOString().split('T')[0],
    imageUrl: ''
  });

  newBookImageFile = signal<File | null>(null);
  editBookImageFile = signal<File | null>(null);
  newBookImagePreview = signal<string | null>(null);
  editBookImagePreview = signal<string | null>(null);
  isDraggingNew = signal(false);
  isDraggingEdit = signal(false);

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
      isbn: book.isbn,
      publicationDate: book.publicationDate.split('T')[0],
      imageUrl: book.imageUrl || ''
    });
    this.editBookImageFile.set(null);
    this.editBookImagePreview.set(null);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedBook.set(null);
  }

  openViewModal(book: Book) {
    this.selectedBook.set(book);
    this.showViewModal.set(true);
  }

  closeViewModal() {
    this.showViewModal.set(false);
    this.selectedBook.set(null);
  }

  addBook() {
    const book = this.newBook();
    if (book.title && book.author && book.isbn) {
      this.bookService.addBook(book).subscribe({
        next: (createdBook) => {
          // If there's an image file, upload it
          const imageFile = this.newBookImageFile();
          if (imageFile) {
            this.bookService.uploadImage(createdBook.id, imageFile).subscribe({
              next: () => {
                this.closeAddModal();
                Swal.fire({
                  icon: 'success',
                  title: 'Book Added!',
                  text: `"${book.title}" has been added to your library with image.`,
                  confirmButtonColor: '#1976d2',
                  timer: 2000,
                  showConfirmButton: false
                });
              },
              error: (error) => {
                console.error('Error uploading image:', error);
                this.closeAddModal();
                Swal.fire({
                  icon: 'warning',
                  title: 'Book Added',
                  text: 'Book added but image upload failed.',
                  confirmButtonColor: '#1976d2'
                });
              }
            });
          } else {
            this.closeAddModal();
            Swal.fire({
              icon: 'success',
              title: 'Book Added!',
              text: `"${book.title}" has been added to your library.`,
              confirmButtonColor: '#1976d2',
              timer: 2000,
              showConfirmButton: false
            });
          }
        },
        error: (error) => {
          console.error('Error adding book:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add book. Please try again.',
            confirmButtonColor: '#1976d2'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in title, author, and ISBN fields.',
        confirmButtonColor: '#1976d2'
      });
    }
  }

  updateBook() {
    const book = this.selectedBook();
    if (book) {
      this.bookService.updateBook(book.id, this.editBook()).subscribe({
        next: () => {
          // If there's a new image file, upload it
          const imageFile = this.editBookImageFile();
          if (imageFile) {
            this.bookService.uploadImage(book.id, imageFile).subscribe({
              next: () => {
                this.closeEditModal();
                Swal.fire({
                  icon: 'success',
                  title: 'Book Updated!',
                  text: `"${this.editBook().title}" has been updated with new image.`,
                  confirmButtonColor: '#1976d2',
                  timer: 2000,
                  showConfirmButton: false
                });
              },
              error: (error) => {
                console.error('Error uploading image:', error);
                this.closeEditModal();
                Swal.fire({
                  icon: 'warning',
                  title: 'Book Updated',
                  text: 'Book updated but image upload failed.',
                  confirmButtonColor: '#1976d2'
                });
              }
            });
          } else {
            this.closeEditModal();
            Swal.fire({
              icon: 'success',
              title: 'Book Updated!',
              text: `"${this.editBook().title}" has been updated successfully.`,
              confirmButtonColor: '#1976d2',
              timer: 2000,
              showConfirmButton: false
            });
          }
        },
        error: (error) => {
          console.error('Error updating book:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update book. Please try again.',
            confirmButtonColor: '#1976d2'
          });
        }
      });
    }
  }

  deleteBook(id: number) {
    const book = this.books().find(b => b.id === id);
    
    Swal.fire({
      title: 'Delete Book?',
      text: `Are you sure you want to delete "${book?.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The book has been removed from your library.',
              confirmButtonColor: '#1976d2',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error deleting book:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete book. Please try again.',
              confirmButtonColor: '#1976d2'
            });
          }
        });
      }
    });
  }

  resetNewBook() {
    this.newBook.set({
      title: '',
      author: '',
      isbn: '',
      publicationDate: new Date().toISOString().split('T')[0],
      imageUrl: ''
    });
    this.newBookImageFile.set(null);
    this.newBookImagePreview.set(null);
  }

  // Image upload handlers for new book
  onNewBookImageDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingNew.set(true);
  }

  onNewBookImageDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingNew.set(false);
  }

  onNewBookImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingNew.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleNewBookImageFile(files[0]);
    }
  }

  onNewBookImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleNewBookImageFile(input.files[0]);
    }
  }

  handleNewBookImageFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.newBookImageFile.set(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newBookImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file.',
        confirmButtonColor: '#1976d2'
      });
    }
  }

  removeNewBookImage() {
    this.newBookImageFile.set(null);
    this.newBookImagePreview.set(null);
  }

  // Image upload handlers for edit book
  onEditBookImageDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingEdit.set(true);
  }

  onEditBookImageDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingEdit.set(false);
  }

  onEditBookImageDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingEdit.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleEditBookImageFile(files[0]);
    }
  }

  onEditBookImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleEditBookImageFile(input.files[0]);
    }
  }

  handleEditBookImageFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.editBookImageFile.set(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editBookImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file.',
        confirmButtonColor: '#1976d2'
      });
    }
  }

  removeEditBookImage() {
    this.editBookImageFile.set(null);
    this.editBookImagePreview.set(null);
  }
}
