import js from '@eslint/js';

export default {
    ...js.configs.recommended,
    languageOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
    },
    rules: {
        // Add or modify rules here as needed
    },
};
