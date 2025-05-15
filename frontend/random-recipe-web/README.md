# Random Recipe Web App (Next.js)

This is a [Next.js](https://nextjs.org) application that fetches and displays random recipes. It uses the App Router and Server Components for data fetching.

## Features

*   Displays random recipes.
*   Built with Next.js (App Router) for server-side rendering and static site generation capabilities.
*   Styled with Tailwind CSS.
*   Utilizes shadcn/ui components (or your chosen UI library, e.g., manually styled with Tailwind).
*   Connects to its dedicated ASP.NET Core backend (RandomRecipeGenerator.API) for recipe data.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. HTTPS Setup for Development
   Google OAuth requires HTTPS, even in development. Follow these steps:

   a. Install mkcert:
   ```bash
   # Using Chocolatey
   choco install mkcert
   ```

   b. Generate development certificates:
   ```bash
   # Install local CA
   mkcert -install
   
   # Create certificates folder
   mkdir certificates
   cd certificates
   
   # Generate certificates for localhost
   mkcert localhost
   ```

   c. Verify certificate installation:
   - Check that `certificates` folder contains:
     - `localhost.pem`
     - `localhost-key.pem`
   - Access https://localhost:3000 in your browser
   - You should see a secure connection without warnings

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
