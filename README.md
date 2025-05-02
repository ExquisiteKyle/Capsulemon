# Next.js SQLite Authentication Project

This is a full-stack application with a Next.js frontend and Express backend, utilizing **SQLite** for data storage. **SQLite was chosen for its simplicity and zero-configuration nature, making it ideal for a small project like this example where a separate database server is not required.**

## Features

- User authentication with username/password
- SQLite database integration
- Modern React frontend with Next.js
- Secure password hashing with bcrypt
- Admin functionality for creating cards

## Tech Stack

This project utilizes the following technologies:

**Frontend:**

- **Next.js:** A React framework for server-side rendering, static site generation, and handling routing and API routes.
- **React:** A JavaScript library for building user interfaces.
- **CSS Modules:** For scoped and modular CSS styling.
- **JavaScript (ES6+):** Modern JavaScript syntax and features.

**Backend:**

- **Node.js:** JavaScript runtime environment for executing server-side code.
- **Express:** A minimal and flexible Node.js web application framework for building APIs.
- **SQLite:** A lightweight, file-based relational database management system. **Its selection for this project is due to its simplicity and ease of embedding, requiring no separate database server setup, which streamlines development and deployment for this example.**
- **`sqlite3`:** Node.js library for interacting with SQLite databases.
- **`bcrypt`:** For securely hashing and comparing passwords.
- **`cors`:** Express middleware for enabling Cross-Origin Resource Sharing.
- **`body-parser`:** Express middleware for parsing incoming request bodies.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development servers:

In one terminal, start the Next.js frontend:

```bash
npm run dev
```

In another terminal, start the Express backend:

```bash
npm run server
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Default Credentials

These are the _only_ users created when the database is initialized, as defined in `server/dbInitializer.js`:

- **Regular User:**
  - Username: `test`
  - Password: `test`
- **Admin User:**
  - Username: `admin`
  - Password: `admin`

## Project Structure

- `/pages` - Next.js pages
- `/styles` - CSS modules
- `/components` - Reusable React components
- `/server` - Express backend server
  - `/server/dbInitializer.js` - Logic for setting up the database schema and default data.
  - `/server/index.js` - Main Express application setup and routes.
- `database.sqlite` - SQLite database file (created automatically on server start)
