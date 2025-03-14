// package.json are "type": "module" ceea ce înseamnă că folosim ESM
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Starting database migration...");
  
  try {
    // Crearea manuală a tabelelor
    console.log("Creating users table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT NOT NULL,
        verified BOOLEAN,
        verification_token TEXT,
        token_expiry TIMESTAMP,
        profile_image TEXT,
        bio TEXT,
        created_at TIMESTAMP
      );
    `);

    console.log("Creating pilgrimages table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pilgrimages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        month TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        price DECIMAL NOT NULL,
        currency TEXT NOT NULL,
        transportation TEXT NOT NULL,
        guide TEXT NOT NULL,
        saint TEXT,
        includes TEXT[],
        excludes TEXT[],
        itinerary TEXT[],
        available_spots INTEGER NOT NULL,
        verified BOOLEAN,
        featured BOOLEAN,
        status TEXT NOT NULL DEFAULT 'active',
        organizer_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP,
        images TEXT[]
      );
    `);

    console.log("Creating reviews table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        pilgrimage_id INTEGER REFERENCES pilgrimages(id),
        user_id INTEGER REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        verified BOOLEAN,
        created_at TIMESTAMP
      );
    `);

    console.log("Creating bookings table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        pilgrimage_id INTEGER REFERENCES pilgrimages(id),
        user_id INTEGER REFERENCES users(id),
        persons INTEGER NOT NULL,
        total_price DECIMAL NOT NULL,
        status TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_id TEXT,
        created_at TIMESTAMP
      );
    `);

    console.log("Creating messages table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id),
        to_user_id INTEGER REFERENCES users(id),
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN NOT NULL,
        created_at TIMESTAMP
      );
    `);

    console.log("Creating cms_content table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cms_content (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        content_type TEXT NOT NULL,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      );
    `);

    console.log("Creating builder_pages table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS builder_pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        page_type TEXT,
        content TEXT NOT NULL,
        meta TEXT,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      );
    `);

    console.log("Creating region_enum type...");
    await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'monastery_region') THEN
          CREATE TYPE monastery_region AS ENUM ('moldova', 'bucovina', 'muntenia', 'oltenia', 'transilvania', 'maramures', 'banat', 'dobrogea');
        END IF;
      END$$;
    `);

    console.log("Creating monasteries table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS monasteries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        short_description TEXT,
        address TEXT NOT NULL,
        region monastery_region NOT NULL,
        city TEXT NOT NULL,
        county TEXT NOT NULL,
        access TEXT,
        patron_saint TEXT,
        patron_saint_date TIMESTAMP,
        founded_year INTEGER,
        history TEXT,
        special_features TEXT,
        relics TEXT[],
        type TEXT NOT NULL,
        images TEXT[],
        cover_image TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        website TEXT,
        latitude DECIMAL,
        longitude DECIMAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating monastery_events table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS monastery_events (
        id SERIAL PRIMARY KEY,
        monastery_id INTEGER REFERENCES monasteries(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date TIMESTAMP NOT NULL,
        is_recurring BOOLEAN NOT NULL,
        recurrence_pattern TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating monastery_services table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS monastery_services (
        id SERIAL PRIMARY KEY,
        monastery_id INTEGER REFERENCES monasteries(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating monastery_schedule table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS monastery_schedule (
        id SERIAL PRIMARY KEY,
        monastery_id INTEGER REFERENCES monasteries(id),
        day_of_week TEXT NOT NULL,
        opening_time TEXT NOT NULL,
        closing_time TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating recipe_type_enum type...");
    await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_type') THEN
          CREATE TYPE recipe_type AS ENUM (
            'de_post', 
            'cu_dezlegare_la_ulei', 
            'cu_dezlegare_la_vin', 
            'cu_dezlegare_la_peste', 
            'cu_dezlegare_completa', 
            'manastireasca'
          );
        END IF;
      END$$;
    `);

    console.log("Creating recipe_category_enum type...");
    await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_category') THEN
          CREATE TYPE recipe_category AS ENUM (
            'supe_si_ciorbe',
            'aperitive',
            'feluri_principale',
            'garnituri',
            'salate',
            'deserturi',
            'conserve',
            'bauturi',
            'paine_si_panificatie'
          );
        END IF;
      END$$;
    `);

    console.log("Creating recipe_difficulty_enum type...");
    await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_difficulty') THEN
          CREATE TYPE recipe_difficulty AS ENUM (
            'incepator',
            'mediu',
            'avansat'
          );
        END IF;
      END$$;
    `);

    console.log("Creating recipe_time_enum type...");
    await db.execute(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_time') THEN
          CREATE TYPE recipe_time AS ENUM (
            'sub_30_minute',
            '30_60_minute',
            'peste_60_minute'
          );
        END IF;
      END$$;
    `);

    console.log("Creating fasting_recipes table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS fasting_recipes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        recipe_type recipe_type NOT NULL DEFAULT 'de_post',
        category recipe_category NOT NULL,
        difficulty recipe_difficulty NOT NULL DEFAULT 'mediu',
        preparation_time recipe_time NOT NULL DEFAULT '30_60_minute',
        ingredients TEXT[] NOT NULL,
        steps TEXT[] NOT NULL,
        image_url TEXT,
        calories INTEGER,
        servings INTEGER NOT NULL DEFAULT 4,
        preparation_minutes INTEGER NOT NULL,
        cooking_minutes INTEGER NOT NULL,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        source TEXT,
        created_by INTEGER REFERENCES users(id),
        monastery_id INTEGER REFERENCES monasteries(id),
        occasion_tags TEXT[],
        feast_day TEXT,
        recommended_for_days TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating recipe_comments table...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recipe_comments (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES fasting_recipes(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adăugare user admin
    console.log("Adding admin user...");
    await db.execute(`
      INSERT INTO users (username, password, email, first_name, last_name, role, verified, created_at)
      VALUES ('admin', 'admin123', 'admin@doxa.com', 'Admin', 'Doxa', 'admin', true, NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();