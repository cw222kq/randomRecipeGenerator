# PostgreSQL Database Infrastructure Documentation

## Overview

This document describes the PostgreSQL database infrastructure implementation for the Random Recipe Generator API. The implementation follows modern .NET 8 practices with Entity Framework Core, Docker containerization, and Test-Driven Development (TDD) principles.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   .NET 8 API    │    │   PostgreSQL    │
│   (Web/Mobile)  │───►│   EF Core       │───►│   Database      │
│                 │    │   Repository    │    │   (Docker)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Setup

### 1. Docker Configuration

**File:** `docker-compose.yml`

```yaml
services:
  postgres:
    image: "postgres:latest"
    container_name: "postgres"
    environment:
      POSTGRES_USER: "postgres"
      POSTGRES_PASSWORD: "password"
      POSTGRES_DB: "RandomRecipeGenerator"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Purpose:**
- Creates isolated PostgreSQL database container
- Persists data through named volumes
- Exposes database on localhost:5432
- Uses latest PostgreSQL version for development

**Commands:**
```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# View logs
docker compose logs postgres
```

### 2. Entity Framework Core Setup

**Dependencies Added:**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.7" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.7" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.7" />
```

**Connection Configuration:**
- Uses .NET User Secrets for local development
- Connection string format: `Host=localhost;Database=RandomRecipeGenerator;Username={username};Password={password}`
- Configured in `Program.cs` with dependency injection
- Actual credentials match docker-compose.yml environment variables

## Domain Models

### User Entity

**File:** `Models/Domain/User.cs`

```csharp
public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(255)]
    public required string GoogleUserID { get; set; }
    
    [Required]
    [StringLength(255)]
    public required string Email { get; set; }
    
    [StringLength(100)]
    public string? FirstName { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property - recipes saved by this user
    public ICollection<Recipe> Recipes { get; set; } = [];
}
```

**Key Features:**
- Primary key: `Guid Id` for global uniqueness
- Google OAuth integration via `GoogleUserID`
- Email uniqueness constraints
- Audit timestamps (`CreatedAt`, `UpdatedAt`)
- One-to-many relationship with recipes

### Recipe Entity

**File:** `Models/Domain/Recipe.cs`

```csharp
public class Recipe
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public required int SpoonacularId { get; set; }
    
    [Required]
    [StringLength(255)]
    public required string Title { get; set; }
    
    [Required]
    public required List<string> Ingredients { get; set; }
    
    [Required]
    [Column(TypeName = "text")]
    public required string Instructions { get; set; }
    
    [StringLength(1000)]
    public string? ImageUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key - which user saved this recipe
    public Guid? UserId { get; set; }
    public virtual User? User { get; set; }
}
```

**Key Features:**
- Links to Spoonacular API via `SpoonacularId`
- Stores ingredients as JSON list (EF Core handles conversion)
- User relationship for saved recipes (only saved recipes are stored in database)
- PostgreSQL `text` type for large content

## Database Context

**File:** `Data/ApplicationDbContext.cs`

```csharp
public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    
    public DbSet<User> Users { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.GoogleUserID).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.UpdatedAt).ValueGeneratedOnUpdate();
        });
        
        // Recipe configuration
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasIndex(r => r.SpoonacularId).IsUnique();
            entity.Property(r => r.UpdatedAt).ValueGeneratedOnUpdate();
            
            entity.HasOne(r => r.User)
                  .WithMany(u => u.Recipes)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

**Configuration Details:**
- **Unique Indexes:** Prevent duplicate Google users and Spoonacular recipes
- **Automatic Timestamps:** `UpdatedAt` auto-updates on entity changes
- **Cascade Delete:** User deletion removes all their saved recipes
- **Nullable Foreign Key:** Allows recipes to exist before being saved by users

## Database Schema

### Tables Created

**Users Table:**
```sql
CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "GoogleUserID" character varying(255) NOT NULL,
    "Email" character varying(255) NOT NULL,
    "FirstName" character varying(100),
    "LastName" character varying(100),
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE UNIQUE INDEX "IX_Users_GoogleUserID" ON "Users" ("GoogleUserID");
```

**Recipes Table:**
```sql
CREATE TABLE "Recipes" (
    "Id" uuid NOT NULL,
    "SpoonacularId" integer NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Ingredients" text NOT NULL,
    "Instructions" text NOT NULL,
    "ImageUrl" character varying(1000),
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "UserId" uuid,
    CONSTRAINT "PK_Recipes" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Recipes_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IX_Recipes_SpoonacularId" ON "Recipes" ("SpoonacularId");
CREATE INDEX "IX_Recipes_UserId" ON "Recipes" ("UserId");
```

## Migration Management

### Initial Migration

**Created:** `20250718163702_InitialCreate.cs`

**Commands Used:**
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update

# View migration status
dotnet ef migrations list
```

### Migration Files

1. **`*_InitialCreate.cs`** - Migration logic (Up/Down methods)
2. **`*_InitialCreate.Designer.cs`** - Migration metadata
3. **`ApplicationDbContextModelSnapshot.cs`** - Current model state

## Configuration Setup

### 1. Program.cs Configuration

```csharp
// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

### 2. User Secrets Setup

```bash
# Set connection string (use actual credentials from docker-compose.yml)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=RandomRecipeGenerator;Username={username};Password={password}"
```

### 3. Production Configuration

For production, use environment variables instead of user secrets:

```bash
export ConnectionStrings__DefaultConnection="Host={production-host};Database=RandomRecipeGenerator;Username={prod-username};Password={secure-prod-password}"
```

## Repository Pattern Foundation

### Interface Definition

**File:** `Repositories/IUserRepository.cs`

```csharp
public interface IUserRepository
{
    Task<User?> GetByGoogleUserIdAsync(string googleUserId);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(Guid id);
}
```

**Design Principles:**
- Async/await for non-blocking operations
- Nullable return types for not-found scenarios
- Clear method naming following repository pattern
- Separation of concerns (interface vs implementation)
- Complete CRUD operations (Create, Read, Update, Delete)

## Testing Infrastructure

### Test Dependencies

**Added to Test Project:**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.7" />
```

### Test Database Strategy

- **In-Memory Database:** Fast, isolated testing
- **Fresh Database Per Test:** Ensures test isolation
- **Same EF Core API:** Tests use production code paths
- **No External Dependencies:** Tests run without PostgreSQL

## Security Considerations

### 1. Connection Strings

- **Development:** User secrets (not in source control)
- **Production:** Environment variables
- **Docker Credentials:** Safe for local development only

### 2. Data Protection

- **Unique Constraints:** Prevent duplicate accounts
- **Email Validation:** Data integrity
- **Cascade Deletes:** GDPR compliance (user data removal)

## Deployment Considerations

### 1. Database Initialization

```csharp
// Apply migrations on startup (use with caution in production)
if (app.Environment.IsDevelopment() || 
    app.Configuration.GetValue<bool>("Database:AutoMigrate"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
}
```

### 2. Connection Pooling

EF Core automatically manages connection pooling for PostgreSQL connections.

### 3. Environment-Specific Configuration

- **Development:** Docker + user secrets
- **Staging:** Managed PostgreSQL + environment variables
- **Production:** Managed PostgreSQL + secure environment variables

## Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Ensure Docker container is running: `docker compose ps`
   - Check port 5432 is not in use: `netstat -an | grep 5432`

2. **Migration Errors:**
   - Verify EF tools installed: `dotnet ef --version`
   - Check connection string: `dotnet user-secrets list`

3. **Permission Errors:**
   - Ensure PostgreSQL user has database creation privileges
   - Check Docker container logs: `docker compose logs postgres`

### Useful Commands

```bash
# Database status
docker exec -it postgres psql -U postgres -d RandomRecipeGenerator -c "\dt"

# View connection info
dotnet user-secrets list --project RandomRecipeGenerator.API

# Reset database
docker compose down -v  # Removes volumes
docker compose up -d
dotnet ef database update
```

## Next Steps

This infrastructure provides the foundation for:

1. **User Repository Implementation** - Complete CRUD operations
2. **Recipe Repository** - Saved recipe management
3. **User Authentication Integration** - Link with Google OAuth
4. **API Endpoints** - User and recipe management endpoints
5. **Advanced Features** - Recipe search, favorites, user profiles

## Related Documentation

- Google OAuth Implementation: `RandomRecipeGenerator.API/docs/GoogleOAuth.md`
- Mobile OAuth Implementation: `RandomRecipeGenerator.API/docs/MobileOAuth.md`
- Frontend Integration: `frontend/random-recipe-web/docs/` and `frontend/random-recipe-router-mobile/docs/` 