import { app } from './app';
import { env } from './common/env';

app.listen(env.PORT, () => {
  console.log(`[backend] Maison Marnoa API running on ${env.BACKEND_URL}`);
});
