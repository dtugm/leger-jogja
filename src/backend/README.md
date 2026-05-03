# Binamarga API

This API provides functionality for managing 3D model data using 3DCityDB.

## Prerequisites

- Node.js 18+ or 20+
- Docker and Docker Compose
- npm or yarn

## Getting Started

### Environment Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd pu-binamarga/src/backend
```

2. Config the environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration.

### Running the application
Run the app using docker compose
```bash
docker compose up -d
```

Generate super admin user
```bash
npm run db:init
```

## Database Migrations

```bash
# Generate a new migration
npm run migration:generate src/db/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Project Structure

```
src/
├── config/                # Configuration
├── db/                    # Database module and migrations
│   └── migrations/
├── domains/               # Business logic modules
│   ├── citydb-tool/      # Tool for interacting with 3dcitydb
│   └── users/            # User management
├── app.module.ts
└── main.ts
```

## Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
