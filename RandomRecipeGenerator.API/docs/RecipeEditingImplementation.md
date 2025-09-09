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

