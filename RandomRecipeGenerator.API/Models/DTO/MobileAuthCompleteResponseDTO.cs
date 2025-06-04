namespace RandomRecipeGenerator.API.Models.DTO
{
    public class MobileAuthCompleteResponseDTO
    {
        public required UserDTO User { get; set; }
        public required string Token { get; set; }
        public required string ExpiresAt { get; set; }
    } 
}
