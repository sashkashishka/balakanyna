# New Task — Client Component Guide

> **Critical:** The client package is written in **SolidJS**, not React. Do not use React hooks (`useState`, `useEffect`, etc.). Use SolidJS primitives: `createSignal`, `createEffect`, `createMemo`, `onMount`, `onCleanup`, `For`, `Show`, etc.

---

## 1. Component File (`client/src/tasks/<MyTask>/<MyTask>.tsx`)

```tsx
import type { TTask } from 'shared/types/task.ts';

interface IProps {
  config: Extract<TTask, { type: 'myTask' }>['config'];
}

export function MyTask({ config }: IProps) {
  // SolidJS component — config is a plain object, not a signal
  // Access config fields directly: config.someField
  return <div>...</div>;
}
```

The `config` prop type must use `Extract<TTask, { type: 'myTask' }>['config']` — this gives you the exact config shape from the shared types.

### Tasks with a separate preview component
Some tasks (e.g. `ImageSlider`, `Brainbox`) export both a full interactive component and a lightweight `*Preview` variant used in the admin area. If the full task has complex game state that shouldn't run in the admin preview, export a separate `MyTaskPreview` component from the same file.

---

## 2. Index File (`client/src/tasks/<MyTask>/index.ts`)

```ts
export { MyTask } from './<MyTask>.tsx';
// If preview variant exists:
// export { MyTask, MyTaskPreview } from './<MyTask>.tsx';
```

---

## 3. Register in Client Tasks Index (`client/src/tasks/index.ts`)

```ts
export { MyTask } from './<MyTask>/index.ts';
// or with preview:
// export { MyTask, MyTaskPreview } from './<MyTask>/index.ts';
```

---

## 4. SolidJS Patterns

### Reactive state
```tsx
const [count, setCount] = createSignal(0);
// read: count()   write: setCount(n) or setCount(prev => prev + 1)
```

### Side effects
```tsx
createEffect(() => {
  // runs when any signal read inside changes
  console.log(count());
});
```

### Derived from config (config is not reactive — it's a prop)
```tsx
// If config can change (e.g. admin preview re-renders with new config):
createEffect(() => {
  // re-initialize state when config fields change
  setTable(generateTable(config.x, config.y));
});
```

### Lists
```tsx
<For each={items()}>
  {(item) => <div>{item.name}</div>}
</For>
```

### Conditional rendering
```tsx
<Show when={isVisible()} fallback={<span>hidden</span>}>
  <div>visible</div>
</Show>
```

### CSS Modules
```tsx
import styles from './<MyTask>.module.css';
// usage: class={styles.container}
```

---

## 5. Image Tasks

For tasks that display images, the config will contain full image objects (`IImageEntry`) with `id`, `path`, `hashsum`, `filename`. The `path` already has the media prefix applied by the server pipeline.

```tsx
import type { IImageEntry } from 'shared/types/image.ts';

// In config type:
// items: Array<{ image: IImageEntry }>

// In template:
<img src={item.image.path} alt={item.image.filename} />
```

---

## Key Invariants

- SolidJS components are functions that run **once** — reactivity comes from signals, not re-renders.
- `config` is a plain prop object. If the admin preview passes a new config, the component re-mounts (SolidJS `render` is called again by `TaskPreview`). Use `createEffect` to react to config-derived state if needed.
- Use `class=` not `className=` in SolidJS JSX.
- The component exported from `client/src/tasks/index.ts` is what gets imported by the admin's `TaskPreview` — the name must match what is added to `TASK_MAP` in `admin/src/components/TaskPreview/TaskPreview.tsx`.
