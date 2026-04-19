# New Task — Server Integration Guide

## 1. Shared Schema (`shared/schemas/<taskName>.js`)

Every task needs an AJV JSON schema. Tasks that reference images need **two schemas**; tasks without images need **one**.

### Non-image task (single schema)
```js
export const myTaskSchema = {
  title: 'MyTaskTaskConfig',
  type: 'object',
  properties: {
    // your fields
  },
  required: [...],
  additionalProperties: false,
};
```

### Image task (upload + full schemas)
```js
import { uploadImageSchema, fullImageSchema } from './common.js';

// Used on CREATE/UPDATE (client sends only { id })
export const uploadMyTaskSchema = { ...uses uploadImageSchema... };

// Used on GET/LIST (server returns full image object with id, path, hashsum, filename)
export const fullMyTaskSchema = { ...uses fullImageSchema... };
```

Reference: `shared/schemas/brainbox.js`, `shared/schemas/imageSlider.js`

---

## 2. Register the Task Type

### `shared/schemas/common.js`
Add the new task name to the `tasks` array:
```js
export const tasks = [
  // ...existing,
  'myTask',
];
```
This array drives the DB enum and the body validation schema.

### `shared/types/task.ts`
1. Add `'myTask'` to `TTaskType`.
2. Add an `IMyTask` interface extending `ITask` with `type` and `config`.
3. Add `IMyTask` to the `TTask` union.

---

## 3. Register Schemas in the Middleware

### `server/src/middleware/api/admin/task/schema/index.js`

Import and add to both maps:
```js
import { myTaskSchema } from 'shared/schemas/myTask.js';
// or for image tasks:
import { uploadMyTaskSchema, fullMyTaskSchema } from 'shared/schemas/myTask.js';

export const uploadTypeToSchema = {
  // ...existing,
  myTask: uploadMyTaskSchema,   // or myTaskSchema for non-image
};

export const fullTypeToSchema = {
  // ...existing,
  myTask: fullMyTaskSchema,     // or myTaskSchema for non-image
};
```

---

## 4. Image Pipes (image tasks only)

### `server/src/middleware/api/admin/task/pipes/image.js`

Add a `case 'myTask':` to all three functions:

**`getUniqueImageIds(task)`** — return all image IDs from the config:
```js
case 'myTask': {
  return [...new Set(task.config.items.map(({ image }) => image.id))];
}
```

**`populateImage(task)`** — replace `{ id }` stubs with full image objects from `task.images`:
```js
case 'myTask': {
  task.config.items = task.config.items.map(({ image }) => ({
    image: task.images.find((img) => img.id === image.id),
  })).filter(({ image }) => image);
  delete task.images;
  return task;
}
```

**`addImagePrefixInTaskConfig(prefix)`** — prepend the media prefix to `path`:
```js
case 'myTask': {
  task.config.items = task.config.items.map(({ image }) => ({
    image: { ...image, path: addPrefixToPathname(image?.path, prefix) },
  }));
  return task;
}
```

Non-image tasks: no changes needed — the `default: return []` / `default: return task` branches handle them.

---

## 5. Integration Tests

Create two test files mirroring existing patterns:

### `server/src/test/middleware/api/admin/task/create/create-<taskName>.test.js`

```js
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { getTestServer } from '../../../../../helpers/getTestServer.js';
import { getAuthCookie } from '../../../../../helpers/utils.js';
import * as taskCreate from '../../../../../../middleware/api/admin/task/create/middleware.js';
import { seedAdmins } from '../../../../../../db/seeders.js';
import { admin } from '../../fixtures/admin.js';
import { myTask } from '../../fixtures/task.js';
import { assertCommonTaskProps } from '../utils.js';
// For image tasks also import: seedImages, images, taskImageTable

describe('[api] task create myTask', () => {
  test('should return 400 if config is invalid', async (t) => { ... });
  test('should return 200 and create task', async (t) => { ... });
  // Image tasks: also assert taskImageTable junction rows
});
```

### `server/src/test/middleware/api/admin/task/update/update-<taskName>.test.js`

Required test cases:
1. `400` — invalid config
2. `400` — wrong type (pass a different task type)
3. `400` — wrong type but valid config for that other type
4. `200` — successful update (assert `body.hash === hash`, `assertCommonTaskProps`)
5. Image tasks only: `200` — repetitive images (assert junction table row count)

### Add fixture to `server/src/test/middleware/api/admin/fixtures/task.js`
```js
export const myTask = {
  name: 'My task',
  type: 'myTask',
  config: { /* valid minimal config */ },
};
```

---

## Key Invariants

- The `config` column stores JSON sorted by keys (`sortJsonKeys`) — duplicate detection relies on this.
- `taskImageTable` is the junction table linking tasks to images. It is rebuilt on every update for image tasks (delete all + re-insert).
- `hash` is set on create and **never changed** on update — tests must assert `body.hash === hash`.
- `verifyTaskConfigSchemaMiddleware` uses `uploadTypeToSchema` (not `fullTypeToSchema`) for both create and update validation.
- `createTransformTask` in `pipes/task.js` runs the full pipeline: `castLabelMapToArray → populateImage → addImagePrefixInTaskConfig → createValidateFullConfig`. No changes needed there.
