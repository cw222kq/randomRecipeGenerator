# Google OAuth Implementation - Backend (ASP.NET Core)

## Overview

This document covers the server-side Google OAuth implementation in the ASP.NET Core API. The backend handles the OAuth flow with Google and manages user sessions using cookie-based authentication.

> **Note**: For frontend implementation details, see [frontend/random-recipe-web/docs/GoogleOAuth.md](../../frontend/random-recipe-web/docs/GoogleOAuth.md)

## Architecture

The backend serves as the OAuth provider proxy:
```
Frontend → ASP.NET Core API → Google OAuth 2.0
        ←                   ←
```

## Dependencies

Add the following NuGet packages:

```xml
<PackageReference Include="Google.Apis.Auth.AspNetCore3" Version="1.69.0" />
```

## Configuration

### 1. User Secrets Setup

Store Google OAuth credentials securely using .NET User Secrets:

```bash
dotnet user-secrets set "Authentication:Google:ClientId" "your-google-client-id"
dotnet user-secrets set "Authentication:Google:ClientSecret" "your-google-client-secret"
```

### 2. Program.cs Configuration

#### Authentication Services

```csharp
builder.Services
    .AddAuthentication(options =>
    {
        // Forces challenge results to be handled by Google OpenID Handler
        options.DefaultChallengeScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
        // Forces forbid results to be handled by Google OpenID Handler
        options.DefaultForbidScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
        // Default scheme for everything else - stores OAuth2 token info in cookies
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
```

#### CORS Configuration

```csharp
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
```

#### Middleware Pipeline

```csharp
app.UseCors("AllowSpecificOrigin");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
```

## AccountController Implementation

### Login Endpoint

Initiates the Google OAuth flow:

```csharp
[HttpGet("login-google")]
public IActionResult LoginGoogle()
{
    var properties = new AuthenticationProperties
    {
        RedirectUri = Url.Action(nameof(GoogleLoginCallback))
    };
    return Challenge(properties, GoogleOpenIdConnectDefaults.AuthenticationScheme);
}
```

### Callback Endpoint

Handles the OAuth callback from Google:

```csharp
[HttpGet("google-login-callback")]
public IActionResult GoogleLoginCallback()
{
    if (User.Identity == null || !User.Identity.IsAuthenticated)
    {
        return BadRequest("External login failed.");
    }

    return Redirect("https://localhost:3000/hello");
}
```

### User Profile Endpoint

Returns authenticated user's profile data:

```csharp
[HttpGet("user")]
public IActionResult GetCurrentUser()
{
    if (User.Identity == null || !User.Identity.IsAuthenticated)
    {
        return Unauthorized();
    }
   
    var userDTO = new UserDTO
    {
        GoogleUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
        Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? string.Empty,
        FirstName = User.FindFirst(System.Security.Claims.ClaimTypes.GivenName)?.Value ?? string.Empty,
        LastName = User.FindFirst(System.Security.Claims.ClaimTypes.Surname)?.Value ?? string.Empty,
    };

    return Ok(userDTO);
}
```

### Logout Endpoint

Clears the authentication session:

```csharp
[HttpGet("logout")]
public async Task<IActionResult> Logout()
{
    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Redirect("https://localhost:3000/");
}
```

## Data Models

### UserDTO

```csharp
public class UserDTO
{
    public required string GoogleUserId { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
```

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/account/login-google` | Initiate Google OAuth flow | None |
| GET | `/api/account/google-login-callback` | Handle OAuth callback | None |
| GET | `/api/account/user` | Get current user profile | Required |
| GET | `/api/account/logout` | Sign out and clear session | Required |

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"

### 2. Configure Redirect URIs

Add these authorized redirect URIs:
- `https://localhost:7087/signin-google` (HTTPS - development)

### 3. Store Credentials

Copy the Client ID and Client Secret, then store them using user secrets (see configuration section above).

## Security Features

### Cookie-Based Authentication
- Secure, HttpOnly cookies
- HTTPS-only in production
- Automatic session expiration

### Claims-Based Authorization
- User profile data extracted from Google claims
- Extensible for role-based permissions
- Type-safe claim access

### CORS Protection
- Specific origin allowlist
- Credentials required for cross-origin requests
- Restricted to necessary HTTP methods

## Error Handling

### Common Issues

1. **redirect_uri_mismatch**
   - Verify redirect URIs in Google Cloud Console match exactly
   - Check `launchSettings.json` ports match configured URIs
   - Ensure HTTPS (7087) URI is configured

2. **Authentication Failures**
   - Verify user secrets are correctly set
   - Check Google Cloud Console project configuration
   - Ensure Google+ API is enabled

3. **CORS Errors**
   - Verify frontend origin in CORS policy
   - Ensure `AllowCredentials()` is configured
   - Check middleware ordering in `Program.cs`

### Debugging

1. Enable detailed logging:
   ```csharp
   builder.Logging.AddConsole();
   builder.Logging.SetMinimumLevel(LogLevel.Debug);
   ```

2. Check authentication events:
   ```csharp
   .AddGoogleOpenIdConnect(options =>
   {
       // ... existing config ...
       options.Events.OnRedirectToIdentityProvider = context =>
       {
           Console.WriteLine($"Redirecting to: {context.ProtocolMessage.RedirectUri}");
           return Task.CompletedTask;
       };
   });
   ```

## Testing

### Manual Testing

1. Start the API project (`dotnet run`)
2. Navigate to `https://localhost:7087/api/account/login-google`
3. Complete Google authentication
4. Verify redirect to frontend
5. Test `/api/account/user` endpoint with cookies
6. Test logout functionality

### Unit Testing

Consider testing:
- Controller actions with mocked authentication
- Claim extraction logic
- Redirect URL generation
- Error handling scenarios

## Future Enhancements

1. **JWT Token Support**: Add stateless JWT tokens alongside cookies
2. **Role-Based Authorization**: Implement user roles and permissions
3. **Refresh Token Handling**: Manage token refresh automatically
4. **Multiple OAuth Providers**: Support additional providers (Facebook, GitHub, etc.)
5. **Session Management**: Add configurable session timeouts and sliding expiration 