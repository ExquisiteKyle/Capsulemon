# Project Website

This is the user-facing website for the project. It runs on port 3002 to avoid conflicts with the admin website and server.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Project Structure

- `app/`: Contains the Next.js app router pages and components
  - `layout.js`: Root layout component
  - `page.js`: Home page component
  - `globals.css`: Global styles
  - `page.module.css`: Home page styles

## Development

This website is built using:

- Next.js 14
- React 18
- CSS Modules

The website runs on port 3002, while:

- Admin website runs on port 3000
- Server runs on port 3001
