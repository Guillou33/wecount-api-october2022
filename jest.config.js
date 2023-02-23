module.exports = {
  collectCoverageFrom: [
    '**/*.{ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@controller/(.*)$': '<rootDir>/src/controller/$1',
    '^@service/(.*)$': '<rootDir>/src/service/$1',
    '^@event/(.*)$': '<rootDir>/src/event/$1',
    '^@entity/(.*)$': '<rootDir>/src/entity/$1',
    '^@repository/(.*)$': '<rootDir>/src/repository/$1',
    '^@manager/(.*)$': '<rootDir>/src/manager/$1',
    '^@deep/responseError/(.*)$': '<rootDir>/src/service/core/error/response/$1',
    '^@deep/routing/(.*)$': '<rootDir>/src/service/core/routing/$1',
    '^@deep/database/(.*)$': '<rootDir>/src/service/core/database/$1'
  },
  globalSetup: '<rootDir>/src/test/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};