import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

async function deploy() {
    try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase environment variables');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Run database migrations
        console.log('Running Prisma migrations...');
        await execAsync('npx prisma migrate deploy');

        // Generate Prisma Client
        console.log('Generating Prisma Client...');
        await execAsync('npx prisma generate');

        // Push schema to Supabase
        console.log('Syncing schema with Supabase...');
        const { error: schemaError } = await supabase.from('schema_migrations').select('*');
        if (schemaError) {
            throw new Error(`Failed to sync schema with Supabase: ${schemaError.message}`);
        }

        // Seed the database if needed
        if (process.env.SEED_DATABASE === 'true') {
            console.log('Seeding the database...');
            await execAsync('npx ts-node scripts/seed.ts');
        }

        console.log('Deployment tasks completed successfully!');
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

deploy(); 