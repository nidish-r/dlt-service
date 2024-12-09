import pkg from 'pg';
const { Pool } = pkg;

// Initialize the database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Function to retrieve any API Key and HMAC Secret if they exist
export const getAnyApiKeyAndSecret = async () => {
    const query = 'SELECT api_key, hmac_secret FROM api_keys LIMIT 1'; // Get the first key available
    const result = await pool.query(query);

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
};

// Function to retrieve API Key and HMAC Secret
export const getApiKeyAndSecret = async (apiKey) => {
    const query = 'SELECT api_key, hmac_secret FROM api_keys WHERE api_key = $1';
    const values = [apiKey];
    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
};

// Function to store API Key and HMAC Secret
export const storeApiKeyAndSecret = async (apiKey, hmacSecret) => {
    const query = 'INSERT INTO api_keys (api_key, hmac_secret) VALUES ($1, $2)';
    const values = [apiKey, hmacSecret];
    await pool.query(query, values);
};

// Function to rotate API Key and HMAC Secret
export const rotateApiKeyAndSecret = async (existingApiKey, newApiKey, newHmacSecret) => {
    const query = 'UPDATE api_keys SET api_key = $2, hmac_secret = $3 WHERE api_key = $1';
    const values = [existingApiKey, newApiKey, newHmacSecret];
    await pool.query(query, values);
};
