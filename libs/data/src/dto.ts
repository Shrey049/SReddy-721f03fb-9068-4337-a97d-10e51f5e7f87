// This file exports DTOs that use class-validator decorators.
// These should ONLY be imported by the backend (API) app, not the frontend.
// The decorators require reflect-metadata which is not available in the browser.

export * from './lib/dto';
