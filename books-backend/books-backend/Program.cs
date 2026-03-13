using books_backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add MySQL configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Add CORS policy for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "http://localhost:5161")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddControllers();

// Add OpenApi services (built-in for .NET 9+)
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAngularApp");

// Serve static files (for book images)
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.Run();
