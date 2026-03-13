using Microsoft.EntityFrameworkCore;
using books_backend.Models;

namespace books_backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
    }
}
