namespace RandomRecipeGenerator.API.Models.Exceptions
{
    public class RecipeParsingException(string message) : RecipeAPIException(message)
    {
    }
}
