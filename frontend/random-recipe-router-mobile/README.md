# Random Recipe Mobile App (Expo Router)

This is a React Native mobile application built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/) that fetches and displays random recipes.

## Features

*   Displays random recipes.
*   Built with Expo for cross-platform development (iOS, Android).
*   Uses Expo Router for file-based routing.
*   Styled with NativeWind (Tailwind CSS for React Native).
*   Connects to its dedicated ASP.NET Core backend (RandomRecipeGenerator.API).

## Get Started

1.  **Clone the repository (if you haven't already):**
    If you're setting this project up fresh or someone else is, they'll need to clone the main repository.
    ```bash
    # Example:
    # git clone https://github.com/cw222kq/randomRecipeGenerator.git
    # cd randomRecipeGenerator/frontend/random-recipe-router-mobile
    ```

2.  **Install dependencies:**
    Make sure you are in the `frontend/random-recipe-router-mobile` directory.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    This application requires environment variables to specify the backend API URL.
    *   Rename the `.env.example` file (located in this directory: `frontend/random-recipe-router-mobile/`) to `.env`.
    *   Update the variables in your new `.env` file. For example:
        ```env
        EXPO_PUBLIC_API_BASE_URL=http://localhost:5027
        ```
        **Note:** The `EXPO_PUBLIC_API_BASE_URL` should point to your running `RandomRecipeGenerator.API` backend. `http://localhost:5027` is a common example; ensure the port matches your backend's actual running port (check its `launchSettings.json`).
        
        **Important for Expo Go on Physical Devices:** If you are running the backend API locally (on `localhost`) and testing the mobile app on a physical device using Expo Go, `localhost` will not be accessible from your phone. You will need to expose your local backend API to the internet, for example, by using a dev tunnel (like `npx expo start --tunnel`, or a tool like ngrok for your backend). Then, update `EXPO_PUBLIC_API_BASE_URL` in your `.env` file to use the public tunnel URL.
        

4.  **Ensure Backend API is Running:**
    Before starting the mobile app, make sure your `RandomRecipeGenerator.API` backend is running. Navigate to its directory (e.g., `../../RandomRecipeGenerator.API`) and start it (e.g., `dotnet run`).


5.  **Start the development server:**
    ```bash
    npx expo start
    ```
    This will open the Expo developer tools in your browser. From there, you can:
    *   Run on an Android emulator or connected device.
    *   Run on an iOS simulator or connected device.
    *   Run in a [development build](https://docs.expo.dev/develop/development-builds/introduction/) if you have one set up.