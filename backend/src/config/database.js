import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const databaseUrl =
    process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is not configured. Add your PostgreSQL connection string to backend/.env."
    );
}

const pool = new Pool({
    connectionString:
        databaseUrl,

    ssl:
        process.env.NODE_ENV === "production"
            ? {
                  rejectUnauthorized: false
              }
            : {
                  rejectUnauthorized: false
              },

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

pool.on(
    "error",
    (error) => {
        console.error(
            "Unexpected PostgreSQL pool error:",
            error
        );
    }
);


export async function query(
    text,
    params = []
) {
    return pool.query(
        text,
        params
    );
}

export async function testDatabaseConnection() {
    const result =
        await pool.query(
            "SELECT NOW() AS current_time"
        );

    return result.rows[0];
}


export async function closeDatabaseConnection() {
    await pool.end();
}


export default pool;