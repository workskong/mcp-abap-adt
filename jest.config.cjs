module.exports = {
  preset: 'ts-jest/presets/default-esm', // ESM + TypeScript 지원
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true
    }]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  moduleDirectories: ['node_modules', 'src']
};
