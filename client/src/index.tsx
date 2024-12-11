import { render } from 'solid-js/web';

import './index.css';
import { Router } from './core/router/router.tsx';
import { Routes } from './routes/index.tsx';
import { ROUTES } from './routes/constants.ts';

const root = document.getElementById('root');

render(
  () => (
    <Router routes={ROUTES}>
      <Routes />
    </Router>
  ),
  root!,
);
