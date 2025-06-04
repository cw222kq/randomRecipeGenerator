namespace RandomRecipeGenerator.API.Models.DTO
{
    public class MobileAuthCompleteRequestDTO
    {
        public required string Code { get; set; }
        public required string State { get; set; }
        public required string RedirectUri { get; set; }
    }
}
