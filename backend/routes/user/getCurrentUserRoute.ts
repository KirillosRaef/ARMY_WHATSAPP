import { Elysia, t } from "elysia";
import { auth } from "../../auth";
export const getCurrentUserRoute = new Elysia()

getCurrentUserRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/current-user', async ({ headers }) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Response('Not authenticated', { status: 401 });
  }
  const user = session.user;
  // console.log('User ID: ', userId);
  return user;
});