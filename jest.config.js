/** @type {import('ts-jest').JestConfigWithTsJest} */
const ignorePatterns = [
  '<rootDir>/dist/',
  '<rootDir>/node_modules/'
];

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ["text", "cobertura"],
  coveragePathIgnorePatterns: ignorePatterns,
  modulePathIgnorePatterns: ignorePatterns,
  testPathIgnorePatterns: ignorePatterns,
  transformIgnorePatterns: ignorePatterns
};
