module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](build|docs|node_modules|scripts)[/\\\\]',
  ],
  testEnvironment: 'node',
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
};
