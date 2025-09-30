namespace Kanban.Infrastructure;

using Kanban.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Entity Framework Core database context for the Kanban application with Identity support.
/// </summary>
public class KanbanDbContext : IdentityDbContext<User>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="KanbanDbContext"/> class.
    /// </summary>
    /// <param name="options">The database context options.</param>
    public KanbanDbContext(DbContextOptions<KanbanDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the collection of boards in the database.
    /// </summary>
    public DbSet<Board> Boards { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of columns in the database.
    /// </summary>
    public DbSet<Column> Columns { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of tasks in the database.
    /// </summary>
    public DbSet<Kanban.Domain.Entities.Task> Tasks { get; set; } = null!;

    /// <summary>
    /// Gets or sets the collection of user settings in the database.
    /// </summary>
    public DbSet<UserSettings> UserSettings { get; set; } = null!;

    /// <summary>
    /// Configures entity relationships and constraints using Fluent API.
    /// </summary>
    /// <param name="modelBuilder">The model builder instance.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity (inherits from IdentityUser)
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);

            // Email and other Identity properties are already configured by IdentityDbContext
        });

        // Configure Board entity
        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Name).IsRequired().HasMaxLength(200);
            entity.Property(b => b.Description).HasMaxLength(2000);
            entity.HasOne(b => b.User)
                  .WithMany(u => u.Boards)
                  .HasForeignKey(b => b.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Column entity
        modelBuilder.Entity<Column>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Order).IsRequired();
            entity.HasOne(c => c.Board)
                  .WithMany(b => b.Columns)
                  .HasForeignKey(c => c.BoardId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Task entity
        modelBuilder.Entity<Kanban.Domain.Entities.Task>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired().HasMaxLength(500);
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.Order).IsRequired();
            entity.HasOne(t => t.Column)
                  .WithMany(c => c.Tasks)
                  .HasForeignKey(t => t.ColumnId)
                  .OnDelete(DeleteBehavior.Cascade);
            
            // Enhanced TaskTaco fields
            entity.Property(t => t.Priority).IsRequired();
            entity.Property(t => t.Labels).HasDefaultValue("[]");
            entity.Property(t => t.Checklist).HasDefaultValue("[]");
            entity.Property(t => t.Stickers).HasDefaultValue("[]");
            entity.Property(t => t.CreatedAt);
            entity.Property(t => t.UpdatedAt);
        });

        // Configure UserSettings entity
        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.UserId).IsRequired();
            entity.Property(s => s.Theme).IsRequired().HasMaxLength(50).HasDefaultValue("Classic Taco");
            entity.Property(s => s.DefaultEmoji).IsRequired().HasMaxLength(10).HasDefaultValue("🌮");
            entity.Property(s => s.CreatedAt).IsRequired();
            entity.Property(s => s.UpdatedAt).IsRequired();
            
            // One-to-one relationship with User
            entity.HasOne(s => s.User)
                  .WithOne(u => u.Settings)
                  .HasForeignKey<UserSettings>(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}