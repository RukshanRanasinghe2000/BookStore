# Books Manager Application

A modern Angular books management application with a clean, library-style UI inspired by Libib.

## Features

- **View Books**: Browse your book collection in a beautiful grid layout with cover images
- **Add Books**: Add new books with title, author, cover image, publication year, and description
- **Edit Books**: Update book information with an intuitive modal interface
- **Delete Books**: Remove books from your collection with confirmation
- **Search**: Real-time search across book titles and authors
- **Alphabet Filter**: Filter books by first letter (A-Z) or view all
- **Grouped Display**: Books are automatically grouped alphabetically
- **Responsive Design**: Clean, modern UI with smooth interactions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to `http://localhost:4200`

## Usage

- Click "Add Items" in the sidebar to add a new book
- Hover over any book cover to see edit and delete buttons
- Use the search bar to find books by title or author
- Click alphabet letters to filter books
- Toggle between Cover and Title view modes

## Technology Stack

- Angular 21.2 with standalone components
- TypeScript
- Signals for reactive state management
- Modern CSS with flexbox and grid

## Project Structure

```
src/app/
├── components/
│   └── book-list/          # Main book list component
├── models/
│   └── book.model.ts       # Book interface
├── services/
│   └── book.service.ts     # Books management service
└── app.ts                  # Root component
```

## Building

To build the project:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.
