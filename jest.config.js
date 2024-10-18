module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': 'ts-jest', // To handle TypeScript files
  },
  testMatch: ['**/test/**/*.test.ts'],
  moduleDirectories: ['node_modules', 'src'], // Adjust this if your src folder is the root
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // If you use path aliases
  },
};
