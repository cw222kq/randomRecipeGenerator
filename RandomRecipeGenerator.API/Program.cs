using RandomRecipeGenerator.API.Mappings;
using RandomRecipeGenerator.API.Services;
using Serilog;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

// Setup and configuring logging
var logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File(
        "Logs/RandomRecipeGenerator_Log.txt", 
        rollingInterval: RollingInterval.Day)
    .MinimumLevel.Information()
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog(logger);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<HttpRequestService>();
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

builder.Services.AddScoped<IHttpRequestService, HttpRequestService>();

// This configures Google.Apis.Auth.AspNetCore3 for use in this app.
builder.Services
    .AddAuthentication(options =>
    {
        // This forces challenge results to be handled by Google OpenID Handler, so there's no
        // need to add an AccountController that emits challenges for Login.
        options.DefaultChallengeScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
        // This forces forbid results to be handled by Google OpenID Handler, which checks if
        // extra scopes are required and does automatic incremental auth.
        options.DefaultForbidScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
        // Default scheme that will handle everything else.
        // Once a user is authenticated, the OAuth2 token info is stored in cookies.
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddGoogleOpenIdConnect(options =>
    {
        string? clientID = builder.Configuration["Authentication:Google:ClientId"];
        string? clientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

        ArgumentNullException.ThrowIfNull(clientID, nameof(clientSecret));
        ArgumentNullException.ThrowIfNull(clientSecret, nameof(clientSecret));

        options.ClientId = clientID;
        options.ClientSecret = clientSecret;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
