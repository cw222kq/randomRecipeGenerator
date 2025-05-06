# Random Recipe Generator

This is a full-stack application consisting of an ASP.NET Core 8 backend REST API using the Spoonacular API. 
The multiple frontend clients are both web and mobile.

**Status:** This is a portfolio project currently under development.

## Technology Stack Highlights

*   **Backend:** C# / ASP.NET Core 8
*   **Frontend:** TypeScript, React, Next.js (Web), React Native / Expo (Mobile)
*   **Styling:** Tailwind CSS

## Project Structure & Setup

This repository uses a monorepo structure:

*   **`RandomRecipeGenerator.API/`**: Contains the backend API.
    *   See [API README](./RandomRecipeGenerator.API/README.md) for backend setup and running instructions.
*   **`frontend/`**: Contains the frontend applications.
    *   `random-recipe-web/`: Next.js web application. (See [Web README](./frontend/random-recipe-web/README.md))
    *   `random-recipe-router-mobile/`: Expo Router mobile application. (See [Mobile README](./frontend/random-recipe-router-mobile/README.md))
   

Please refer to the specific README files within each project directory for detailed setup instructions.