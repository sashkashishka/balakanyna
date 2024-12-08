import { navigate } from '@/core/router/utils.ts';

export function NotFoundPage() {
  return (
    <div>
      Not found page
      <br />
      <button onClick={() => navigate('/')}>go to home page</button>
    </div>
  );
}
