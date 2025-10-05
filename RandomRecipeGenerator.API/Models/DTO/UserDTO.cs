namespace RandomRecipeGenerator.API.Models.DTO
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public required string GoogleUserId { get; set; }
        public required string Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
