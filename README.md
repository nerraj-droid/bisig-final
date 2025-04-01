This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# To run with local database
npm run dev:local

# To run with Supabase
npm run dev:supabase

# Standard dev command (uses current .env settings)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

This project supports both local PostgreSQL and Supabase for database management. Below are instructions for setting up and switching between environments.

### Environment Setup

1. Create two environment files:
   - `.env.local` - Contains local database connection strings
   - `.env.supabase` - Contains Supabase connection strings

Example `.env.local`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bisig_db"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/bisig_db"
```

### Local Database Setup

1. Create a PostgreSQL database named `bisig_db`
2. Push the schema to your local database:

   ```bash
   npx prisma db push
   ```

3. Seed your local database with sample data:

   ```bash
   npm run seed:local
   ```

### Database Migrations

For **local development**:

- Use `npx prisma db push` for quick schema updates without migration history
- Perfect for local experimentation and testing

For **Supabase** (production/staging):

- Use `npx prisma migrate dev --name your_migration_name` to create tracked migrations
- This creates migration history files for proper change management
- Supports rollbacks and safer schema evolution

### Switching Environments

The following scripts are available for switching between environments:

```bash
# Switch to local database and run dev server
npm run dev:local

# Switch to Supabase and run dev server
npm run dev:supabase

# Seed the local database (copies .env.local to .env first)
npm run seed:local
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
