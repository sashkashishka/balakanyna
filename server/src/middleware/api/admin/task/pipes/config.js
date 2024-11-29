import { getTaskConfigValidator } from '../schema/index.js';

export function createValidateFullConfig(ctx) {
  return function validateFullConfig(task) {
    const validate = getTaskConfigValidator(ctx.ajv, task.type, false);

    validate(task.config);

    task.errors = validate.errors;

    return task;
  };
}
