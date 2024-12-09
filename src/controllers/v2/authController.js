import { generateApiKey, generateHmacSecret } from '../../utils/cryptoUtils.js';
import { storeApiKeyAndSecret, rotateApiKeyAndSecret, getAnyApiKeyAndSecret } from '../../services/v2/apiKeyService.js';

// Function to generate a new API key and HMAC secret
export const createApiKey = async () => {
    // Check if an API key already exists
    const existingKey = await getAnyApiKeyAndSecret(); // Check for any existing key
    if (existingKey) {
        throw new Error('API key has already been generated');
    }

    const apiKey = generateApiKey();
    const hmacSecret = generateHmacSecret();

    // Store the keys in the database
    await storeApiKeyAndSecret(apiKey, hmacSecret);

    return { apiKey, hmacSecret };
};

// Function to rotate the API key and HMAC secret
export const rotateApiKey = async (existingApiKey) => {
    const newApiKey = generateApiKey();
    const newHmacSecret = generateHmacSecret();

    // Rotate keys in the database
    await rotateApiKeyAndSecret(existingApiKey, newApiKey, newHmacSecret);

    return { apiKey: newApiKey, hmacSecret: newHmacSecret };
};
