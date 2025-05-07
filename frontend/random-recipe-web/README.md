# Random Recipe Web App (Next.js)

This is a [Next.js](https://nextjs.org) application that fetches and displays random recipes. It uses the App Router and Server Components for data fetching.

## Features

*   Displays random recipes.
*   Built with Next.js (App Router) for server-side rendering and static site generation capabilities.
*   Styled with Tailwind CSS.
*   Utilizes shadcn/ui components (or your chosen UI library, e.g., manually styled with Tailwind).
*   Connects to its dedicated ASP.NET Core backend (RandomRecipeGenerator.API) for recipe data.

## Getting Started

1.  **Clone the repository (if you haven't already):**
    If you're setting this project up fresh or someone else is, they'll need to clone the main repository.
    ```bash
    # Example:
    # git clone https://github.com/cw222kq/randomRecipeGenerator.git
    # cd randomRecipeGenerator/frontend/random-recipe-web
    ```

2.  **Install dependencies:**
    Make sure you are in the `frontend/random-recipe-web` directory.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    This application requires environment variables to specify the backend API URL for client-side requests (if any) or during build time if not fetched directly by Server Components.
    *   Rename the `.env.local.example` file (located in this directory: `frontend/random-recipe-web/`) to `.env.local`. (Next.js convention for local environment variables).
    *   Update the variables in your new `.env.local` file. For example:
        ```env
        NEXT_PUBLIC_API_BASE_URL=http://localhost:5027 
        ```
        **Note:** 
        *   The `NEXT_PUBLIC_API_BASE_URL` should point to your running `RandomRecipeGenerator.API` backend. `http://localhost:5027` is an example; ensure the port matches your backend's actual running port (check its `launchSettings.json`).
        *   Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. If the API is only called server-side by Server Components, you might not need the `NEXT_PUBLIC_` prefix and can just use a variable like `API_BASE_URL` (accessed via `process.env.API_BASE_URL` in server-side code).

4.  **Ensure Backend API is Running:**
    Before starting the web app, make sure your `RandomRecipeGenerator.API` backend is running. Navigate to its directory (e.g., `../../RandomRecipeGenerator.API`) and start it (e.g., `dotnet run`).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) with your browser to see the result. The page auto-updates as you edit files.