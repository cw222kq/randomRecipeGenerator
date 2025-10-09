# Recipe Editing Implementation Documentation

## Overview

This document describes the Recipe Editing implementation for the Random Recipe Generator API. The implementation follows Test-Driven Development (TDD) methodology with a clean architecture pattern consisting of Repository, Service, and Controller layers. This feature enables users to create, read, update, and delete their own recipes with proper ownership validation.

## Business Requirements

**Core Functionality**: Users can:
- **Create custom recipes** with title, ingredients, instructions, and optional image URL
- **View their recipes** (all recipes or individual recipe by ID)
- **Update their recipes** (owners only)
- **Delete their recipes** (owners only)
- **Recipe ownership** enforced for all modification operations

## Architecture Overview

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│   RecipeController  │──────▶│   RecipeService     │──────▶│   RecipeRepository  │──────▶│   PostgreSQL DB     │
│    (API Layer)      │       │  (Business Logic)   │       │   (Data Access)     │       │     (Recipes)       │
└─────────────────────┘       └─────────────────────┘       └─────────────────────┘       └─────────────────────┘
```

## Implementation Layers

### 1. Domain Model

**File**: `Models/Domain/Recipe.cs`

```csharp
public class Recipe
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public required int SpoonacularId { get; set; }  // 0 = user-created, >0 = API recipe

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

    // Recipe ownership and audit fields
    public Guid? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<UserFavoriteRecipe> UserFavoriteRecipes { get; set; } = [];
}
```

**Key Features:**
- **Dual Purpose**: Handles both Spoonacular API recipes and user-created recipes
- **Recipe Ownership**: `UserId` field for ownership tracking
- **SpoonacularId Differentiation**: 0 = user-created, >0 = API recipe
- **Audit Fields**: `CreatedAt` and `UpdatedAt` for change tracking

### 2. Data Transfer Objects (DTOs)

**RecipeRequestDTO** (for Create/Update operations):
```csharp
public class RecipeRequestDTO
{
    [Required]
    [StringLength(255, MinimumLength =1)]
    public required string Title { get; set; }

    [Required]
    [MinLength(1)]
    public required List<string> Ingredients { get; set; }

    [Required]
    [MinLength(1)]
    public required string Instructions { get; set; }

    [StringLength(1000)]
    public string? ImageUrl { get; set; }
}
```

**RecipeDTO** (for API responses):
```csharp
public class RecipeDTO
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required List<string> Ingredients { get; set; }
    public required string Instructions { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? UserId { get; set; }
}
```

### 3. Repository Layer (Data Access)

**Interface**: `Repositories/IRecipeRepository.cs`

```csharp
public interface IRecipeRepository
{
    Task<Recipe?> CreateRecipeAsync(Recipe recipe);
    Task<Recipe?> GetRecipeByIdAsync(Guid id);
    Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId);
    Task<Recipe?> UpdateRecipeAsync(Recipe recipe);
    Task<bool> DeleteRecipeAsync(Guid id);
    Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId);
}
```

**Implementation**: `Repositories/RecipeRepository.cs`

**Key Implementation Points:**
- Input validation with guard clauses for empty GUIDs and required fields
- Automatic timestamp management (CreatedAt/UpdatedAt)
- Recipe ownership validation through IsRecipeOwnerAsync method
- Structured logging with proper error handling
- Efficient LINQ queries with method chaining
- Uses FindAsync() for primary key lookups and Include() for navigation properties

### 4. Service Layer (Business Logic)

**Interface**: `Services/IRecipeService.cs`

```csharp
public interface IRecipeService
{
    Task<Recipe?> CreateUserRecipeAsync(Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null);
    Task<Recipe?> GetRecipeByIdAsync(Guid id);
    Task<IEnumerable<Recipe>> GetUserRecipesAsync(Guid userId);
    Task<Recipe?> UpdateUserRecipeAsync(Guid recipeId, Guid userId, string title, List<string> ingredients, string instructions, string? imageUrl = null);
    Task<bool> DeleteUserRecipeAsync(Guid recipeId, Guid userId);
    Task<bool> IsRecipeOwnerAsync(Guid recipeId, Guid userId);
}
```

**Implementation**: `Services/RecipeService.cs`

**Key Implementation Points:**
- Business validation for all input parameters (GUIDs, strings, collections)
- Recipe ownership enforcement for update/delete operations
- Sets SpoonacularId = null for user-created recipes
- Comprehensive logging at Information/Warning/Error levels
- Exception handling with detailed error logging
- Delegates data operations to repository layer

### 5. Controller Layer (API Endpoints)

**Extended Controller**: `Controllers/RecipeController.cs`

**API Endpoints:**
- **POST** `/api/recipe/{userId}` - Create user recipe
- **GET** `/api/recipe/user/{id}` - Get specific recipe by ID
- **GET** `/api/recipe/user/{userId}/all` - Get all user's recipes
- **PUT** `/api/recipe/{id}/user/{userId}` - Update user recipe
- **DELETE** `/api/recipe/{id}/user/{userId}` - Delete user recipe

**Key Features:**
- RESTful design with standard HTTP verbs and status codes
- AutoMapper integration for DTO mapping
- Comprehensive error handling with try-catch blocks
- Structured logging with request/response tracking
- Consistent with existing API response patterns

### 6. AutoMapper Configuration

**File**: `Mappings/AutoMapperProfiles.cs`

```csharp
public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<Recipe, RecipeDTO>().ReverseMap();
        CreateMap<User, UserDTO>().ReverseMap();
        
        // Recipe request mapping - from DTO to Domain (for incoming requests)
        CreateMap<RecipeRequestDTO, Recipe>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.SpoonacularId, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.UserFavoriteRecipes, opt => opt.Ignore());
    }
}
```

## Dependency Injection Configuration

**File**: `Program.cs`

```csharp
// Register repositories and their interfaces
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();

// Register services and their interfaces
builder.Services.AddScoped<IRecipeService, RecipeService>();
```

## Recipe Ownership Concept

### Two Types of Recipes

**1. Spoonacular Recipes (External API → User Owned When Favorited)**
- **SpoonacularId**: Has actual API ID (e.g., 12345)
- **UserId**: `null` initially, **automatically set to user ID when favorited**
- **Purpose**: Recipe discovery → personal recipe collection
- **Mutability**: **Full CRUD operations after favoriting** (ownership transfer)

**2. User-Created Recipes (Custom Recipes)**
- **SpoonacularId**: 0 (indicates user-created)
- **UserId**: Set to recipe creator's ID
- **Purpose**: Personal recipe collection
- **Mutability**: Full CRUD operations for owners only

### Ownership Transfer Process

**When Favoriting Spoonacular Recipes:**
1. User favorites a Spoonacular recipe (`UserId = null`)
2. System automatically transfers ownership (`recipe.UserId = userId`)
3. Recipe becomes fully editable through existing CRUD endpoints
4. User can now personalize ingredients, instructions, and other details

**When Favoriting User-Owned Recipes:**
- Ownership remains with original creator
- Favoring user cannot edit the recipe
- Multiple users can favorite the same user-created recipe

### Ownership Validation

**Repository Level**: `IsRecipeOwnerAsync()` method checks database for recipe ownership
**Service Level**: Validates ownership before update/delete operations
**Authorization**: Only recipe owners can modify or delete their recipes
**Favorites Integration**: Automatic ownership transfer during favoriting process

## Error Handling Strategy

### Consistent Error Patterns

**Repository Layer**: Returns `null`/`false` for failures, comprehensive structured logging
**Service Layer**: Input validation, business logic enforcement, exception handling
**Controller Layer**: 
- **Create**: Service returns `null` → `BadRequest` (400)
- **Get**: Service returns `null` → `NotFound` (404)
- **Update**: Service returns `null` → `NotFound` (404)
- **Delete**: Service returns `false` → `NotFound` (404)
- **All Endpoints**: Unhandled exceptions → `InternalServerError` (500)

## API Documentation

### Endpoints

#### Create User Recipe
- **Method**: `POST`
- **URL**: `/api/recipe/{userId}`
- **Body**: RecipeRequestDTO
- **Response**: `200 OK` with RecipeDTO, `400 Bad Request` if validation fails

#### Get Recipe by ID
- **Method**: `GET`
- **URL**: `/api/recipe/user/{id}`
- **Response**: `200 OK` with RecipeDTO, `404 Not Found` if not exists

#### Get User's Recipes
- **Method**: `GET`
- **URL**: `/api/recipe/user/{userId}/all`
- **Response**: `200 OK` with RecipeDTO array

#### Update User Recipe
- **Method**: `PUT`
- **URL**: `/api/recipe/{id}/user/{userId}`
- **Body**: RecipeRequestDTO
- **Response**: `200 OK` with RecipeDTO, `404 Not Found` if not owned

#### Delete User Recipe
- **Method**: `DELETE`
- **URL**: `/api/recipe/{id}/user/{userId}`
- **Response**: `204 No Content` if deleted, `404 Not Found` if not owned

### Example Requests

```bash
# Create recipe
curl -X POST "https://api.example.com/api/recipe/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Chocolate Cake",
    "ingredients": ["2 cups flour", "1 cup sugar", "1/2 cup cocoa powder"],
    "instructions": "Mix dry ingredients, add wet ingredients, bake at 350°F for 30 minutes",
    "imageUrl": "https://example.com/cake.jpg"
  }'

# Get user's recipes
curl -X GET "https://api.example.com/api/recipe/user/123e4567-e89b-12d3-a456-426614174000/all"

# Update recipe
curl -X PUT "https://api.example.com/api/recipe/987fcdeb-51a2-43d1-b678-123456789abc/user/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Chocolate Cake",
    "ingredients": ["2 cups flour", "1.5 cups sugar", "1/2 cup cocoa powder"],
    "instructions": "Mix dry ingredients, add wet ingredients, bake at 375°F for 25 minutes"
  }'

# Delete recipe
curl -X DELETE "https://api.example.com/api/recipe/987fcdeb-51a2-43d1-b678-123456789abc/user/123e4567-e89b-12d3-a456-426614174000"
```

## TDD Development Process

### Red-Green-Refactor Cycle

**1. RED Phase - Write Failing Tests**
- Repository tests for all CRUD operations
- Service tests for business logic validation
- Controller tests for HTTP response handling

**2. GREEN Phase - Minimal Implementation**
- Implement just enough code to pass tests
- No validation or error handling initially

**3. REFACTOR Phase - Improve Code Quality**
- Add comprehensive validation and error handling
- Add structured logging
- Improve error messages and responses


## Integration Points

### Existing System Integration
- **User Management**: Integrates with existing User domain model
- **Recipe Management**: Extends existing Recipe domain model with ownership
- **Favorites System**: Seamless integration with UserFavoriteRepository for ownership transfer
- **Database Context**: Uses existing ApplicationDbContext
- **Logging System**: Follows existing structured logging patterns
- **Error Handling**: Consistent with existing API error response patterns
- **Dependency Injection**: Follows existing service registration patterns

### Favorites System Integration
The Recipe Editing feature integrates seamlessly with the existing Recipe Favorites system:

**Ownership Transfer Flow:**
1. User discovers Spoonacular recipe through random generation
2. User favorites the recipe via `POST /api/favorite/{userId}/{recipeId}`
3. **Automatic ownership transfer**: Recipe becomes user-owned (`UserId` set)
4. User can now edit the recipe via `PUT /api/recipe/{id}/user/{userId}`
5. User has full CRUD control over their personalized version

**Business Benefits:**
- **Recipe Discovery**: Access to Spoonacular's vast recipe database
- **Recipe Personalization**: Users can customize recipes to their preferences
- **Consistent Experience**: All user recipes behave uniformly regardless of origin
- **Data Ownership**: Users own their favorited recipes for full control

## Performance Considerations

### Database Operations
- **Efficient Queries**: LINQ method chaining for database-side operations
- **Indexed Lookups**: Primary key and foreign key indexes
- **Navigation Loading**: Strategic use of Include() for related data

### Query Optimization Examples
```csharp
// Optimized user recipes retrieval
await _context.Recipes
    .Where(r => r.UserId == userId)           // Filter by user (indexed)
    .OrderByDescending(r => r.UpdatedAt)      // Sort on database
    .ToListAsync();                           // Single round-trip

// Efficient ownership check
await _context.Recipes
    .AnyAsync(r => r.Id == recipeId && r.UserId == userId);  // Early exit on match
```

## Security Considerations ✅ FULLY IMPLEMENTED

### Data Protection
- ✅ **Input validation** with guard clauses and data annotations
- ✅ **SQL injection prevention** through EF Core parameterized queries
- ✅ **Recipe ownership validation** at multiple layers

### Access Control
- ✅ **User isolation** through ownership checks
- ✅ **Authorization enforcement** before modification operations
- ✅ **Audit trail** through CreatedAt/UpdatedAt timestamps

## Success Metrics

### Implementation Achievements
- ✅ **TDD Methodology**: Red-Green-Refactor cycles followed throughout development
- ✅ **Clean Architecture**: Repository-Service-Controller separation with dependency injection
- ✅ **Full CRUD Operations**: Create, read, update, and delete operations implemented
- ✅ **Recipe Ownership**: Proper authorization checks and user isolation
- ✅ **Input Validation**: Comprehensive validation across all layers
- ✅ **Modern C# Practices**: Primary constructors, nullable reference types, collection expressions
- ✅ **RESTful API**: Standard HTTP verbs and status codes
- ✅ **Test Coverage**: Comprehensive unit tests for all layers

## Conclusion

This Recipe Editing implementation provides a complete CRUD system for both user-created recipes and favorited Spoonacular recipes with intelligent ownership management. The implementation demonstrates:

- **Test-Driven Development** ensuring code testability and requirement fulfillment
- **Clean Architecture** with clear separation of concerns
- **Smart Ownership Transfer** automatically converting Spoonacular recipes to user-owned when favorited
- **Recipe Personalization** enabling users to customize any recipe they favorite
- **Seamless Favorites Integration** bridging recipe discovery and recipe management
- **Modern C# Practices** leveraging latest language features
- **RESTful API Design** following standard conventions
- **Comprehensive Error Handling** with structured logging

### Key Innovation: Discovery-to-Ownership Pipeline

This implementation creates a powerful user experience:

1. **Discover**: Users explore Spoonacular's vast recipe database
2. **Favorite**: One-click favoriting with automatic ownership transfer
3. **Personalize**: Full editing capabilities for all favorited recipes
4. **Manage**: Consistent CRUD operations across all user recipes

The system seamlessly integrates with the existing Random Recipe Generator application while adding robust recipe management capabilities that transform external recipe discovery into personal recipe ownership and customization.