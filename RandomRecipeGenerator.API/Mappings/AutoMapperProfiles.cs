using AutoMapper;
using RandomRecipeGenerator.API.Models.Domain;
using RandomRecipeGenerator.API.Models.DTO;

namespace RandomRecipeGenerator.API.Mappings
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<Recipe, RecipeDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();

            // Recipe request mapping - for incoming requests (from DTO to Domain)
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
}
