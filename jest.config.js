/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  extensionsToTreatAsEsm: ['.d.ts, .ts'],
  setupFiles: ['<rootDir>/.jest/common.ts'],
}
