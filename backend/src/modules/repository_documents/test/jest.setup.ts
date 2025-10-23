import '@nestjs/testing';

// No direct import of '@types/jest' (types-only) - TypeScript will pick up Jest types
// via tsconfig "types" or the test tsconfig. Avoid importing 'jest' here.
jest.setTimeout(10000);