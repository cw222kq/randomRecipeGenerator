using RandomRecipeGenerator.API.Mappings;
using RandomRecipeGenerator.API.Services;
using Serilog;

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
