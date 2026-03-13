using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using books_backend.Data;
using books_backend.Models;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace books_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public BooksController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET all books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books.ToListAsync();
        }

        // GET book by id
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);

            if (book == null)
                return NotFound();

            return book;
        }

        // POST create book
        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        // PUT update book
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, Book book)
        {
            if (id != book.Id)
                return BadRequest();

            _context.Entry(book).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE book
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);

            if (book == null)
                return NotFound();

            // Optional: delete the image file if it exists
            if (!string.IsNullOrEmpty(book.ImageUrl))
            {
                var imagePath = Path.Combine(_environment.WebRootPath, book.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/books/upload-image/{id}
        [HttpPost("upload-image/{id}")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound("Book not found.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update the book's ImageUrl
            book.ImageUrl = $"/images/{fileName}";
            _context.Entry(book).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = book.ImageUrl });
        }

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}
