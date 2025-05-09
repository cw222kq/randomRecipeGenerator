# Random Recipe Generator - Backend API

This folder contains the ASP.NET Core 8 backend REST API for the Random Recipe Generator application. It handles fetching data from the Spoonacular API and serving it to the frontend clients.

**Note:** This backend API is currently under development as part of a larger portfolio project. Features are actively being added and refined.

## Prerequisites

*   [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) installed.
*   A Spoonacular API Key (obtainable from [Spoonacular API](https://spoonacular.com/food-api)).

## Configuration

1.  **API Key:**
    *   The API requires a Spoonacular API key to function.
    *   Copy the provided `appsettings.Example.json` file in this directory and rename the copy to `appsettings.Development.json`.
    *   **Ensure `appsettings.Development.json` is included in your `.gitignore` file.** (This is crucial to avoid committing your secret key).
    *   Open the new `appsettings.Development.json` file and replace `"your-api-key-here"` with your actual Spoonacular API key. It should look similar to this (keeping other settings intact):
        ```json
        {
          "Logging": {
            "LogLevel": {
              "Default": "Information",
              "Microsoft.AspNetCore": "Warning"
            }
          },
          // --- Paste your actual API Key below ---
          "SpoonacularApiKey": "YOUR_REAL_SPOONACULAR_API_KEY"
        }
        ```

## Authentication

This API supports user authentication via Google Sign-In.

*   **Google Sign-In:** Users can authenticate using their Google accounts. The API handles the OAuth 2.0 flow with Google.
    *   The primary endpoints for this are `/api/account/login-google` (to initiate login) and `/api/account/google-login-callback` (the callback URL for Google to redirect to after successful authentication).
    *   **Local Development:** Client ID and Client Secret for Google OAuth are configured using the **.NET Secret Manager**. This means they are stored in a `secrets.json` file located in your user profile directory (e.g., `%APPDATA%\Microsoft\UserSecrets\<user_secrets_id>\secrets.json` on Windows or `~/.microsoft/usersecrets/<user_secrets_id>/secrets.json` on macOS/Linux), not directly in the project's `appsettings.json` files. The .NET Secret Manager tool is for local development only and these secrets are not deployed.
    *   **Production:** For production environments, these secrets (Client ID and Client Secret) **must not** be managed with the .NET Secret Manager. Instead, they should be configured securely using **environment variables** on your hosting platform (e.g., Azure App Service Application Settings, AWS Environment Properties, Docker environment variables) or a dedicated secret management service like Azure Key Vault, AWS Secrets Manager, or HashiCorp Vault. Your application will automatically pick up these values if they are set as environment variables (e.g., `Authentication:Google:ClientId` and `Authentication:Google:ClientSecret`). Refer to the `Program.cs` for how these secrets are loaded by the Google authentication services.
*   **Account Handling (Planned):**
    *   Upon successful sign-in with Google, the system will check if a user account associated with that Google ID already exists in the application's database.
    *   If no existing account is found, a new user account will be automatically created and linked to their Google identity. (This database interaction logic is planned for implementation in the `AccountController`'s callback method).


## Running the API Locally

There are several ways to run the API:

1.  **Using .NET CLI:**
    *   Open a terminal and navigate to this directory (`RandomRecipeGenerator.API`).
    *   Run the command:
        ```bash
        dotnet run --launch-profile http
        ```

2.  **Using Visual Studio:**
    *   Open the `RandomRecipeGenerator.sln` file (located in the root directory) in Visual Studio.
    *   Set `RandomRecipeGenerator.API` as the startup project.
    *   Select the desired launch profile (e.g., `http` or `https`) from the debug toolbar.
    *   Press F5 or click the green "Run" button.

The API will start, and the terminal or Visual Studio output window will show the URLs it's listening on ``(e.g., https://localhost:7087, http://localhost:5027)``.

## API Documentation (Swagger/OpenAPI)

This API uses Swagger for documentation (if configured). Once the API is running, you can typically access the interactive documentation in your browser at:

`/swagger` (e.g., `https://localhost:7087/swagger` or `http://localhost:5027/swagger`)

This interface allows you to view all available endpoints, their parameters, and test them directly.