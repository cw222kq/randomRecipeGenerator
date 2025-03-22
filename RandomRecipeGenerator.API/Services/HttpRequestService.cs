using System.Net.Http;
using System.Text.Json;

namespace RandomRecipeGenerator.API.Services
{
    public class HttpRequestService(HttpClient httpClient)
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<string> GetAsync(string url)
        { 
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                var response = await _httpClient.SendAsync(request);

                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"An error occurred: {e.Message}");
                throw;
            }
        }

    }
}
