# API Server (apps/api)

Minimal Express-based API for admin and public endpoints with Prisma ORM for database persistence.

## Setup Instructions

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Database Setup

The API uses SQLite for local development (configured in `prisma/schema.prisma`). For production, you can switch to PostgreSQL by updating the datasource in the schema.

#### Generate Prisma Client
```bash
npm run prisma:generate
```

#### Run Database Migrations
```bash
npm run prisma:migrate
```

This will:
- Create the SQLite database file (`prisma/dev.db`)
- Apply all migrations to create the database schema

#### Seed Initial Data
```bash
npm run prisma:seed
```

This will populate the database with initial tour data.

### 3. Start Development Server
```bash
npm run dev
```

The API server will start on http://localhost:4000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm run start` - Start production server (requires build first)
- `npm run prisma:generate` - Generate Prisma Client from schema
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database with initial data

## Database Options

### SQLite (Default - Local Development)
The default configuration uses SQLite with `file:./dev.db` as the datasource URL. This is perfect for local development as it requires no additional setup.

### PostgreSQL (Production)
To use PostgreSQL, update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/discovergroup"
```

After changing the datasource, regenerate the client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## API Endpoints

### Admin Tours
- `GET /admin/tours` - List all tours
- `POST /admin/tours` - Create a new tour
- `GET /admin/tours/:id` - Get a tour by ID
- `PUT /admin/tours/:id` - Update a tour
- `DELETE /admin/tours/:id` - Delete a tour

### Public Tours
- `GET /public/tours` - List published tours