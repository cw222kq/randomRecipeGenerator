using RandomRecipeGenerator.API.Mappings;
using RandomRecipeGenerator.API.Services;
using Serilog;
using Google.Apis.Auth.AspNetCore3;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using RandomRecipeGenerator.API.Data;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RandomRecipeGenerator.API.Repositories;

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

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("https://localhost:3000")
                   .AllowCredentials()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<HttpRequestService>();
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

// Register repositories and their interfaces
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register services and their interfaces
builder.Services.AddScoped<IHttpRequestService, HttpRequestService>();
builder.Services.AddScoped<IOAuthService, OAuthService>();
builder.Services.AddScoped<IUserService, UserService>();

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

// Configure JWT settings
builder.Services.AddAuthentication() // Adding authentication to our application
    .AddJwtBearer("Mobile", options => // Adding the JWT token
    options.TokenValidationParameters = new TokenValidationParameters // Adding the parameters that we want the token to be validated against
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "secret-key"))
    });

// Session support for OAuth state management
builder.Services.AddDistributedMemoryCache(); // In-memory cache for session state
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set session timeout
    options.Cookie.HttpOnly = true; // Make the session cookie HTTP only
    options.Cookie.IsEssential = true; // Make the session cookie essential
});

// Db config
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowSpecificOrigin");
app.UseHttpsRedirection();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
