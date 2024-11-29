import { createSignal } from 'solid-js';

export function SemaphoreText() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <h1>SemaphoreText 123</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is "{count()}"
        </button>
      </div>
    </>
  );
}
