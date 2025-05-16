using RandomRecipeGenerator.API.Mappings;
using RandomRecipeGenerator.API.Services;
using Serilog;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Authentication.Cookies;
using RandomRecipeGenerator.API.Models.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

// Setup and configure JWT
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
if (jwtSettings == null ||
    string.IsNullOrEmpty(jwtSettings.Key) || 
    string.IsNullOrEmpty(jwtSettings.Issuer) ||
    string.IsNullOrEmpty(jwtSettings.Audience))
{
    throw new Exception("JWT configuration is missing or is invalid.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        });
   

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

        ArgumentNullException.ThrowIfNull(clientID, nameof(clientID));
        ArgumentNullException.ThrowIfNull(clientSecret, nameof(clientSecret));

        options.ClientId = clientID;
        options.ClientSecret = clientSecret;
        options.CallbackPath = "/signin-google";

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
