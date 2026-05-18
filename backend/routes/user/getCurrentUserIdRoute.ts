import { Elysia, t } from "elysia";
import { auth } from "../../auth";
export const getCurrentUserIdRoute = new Elysia()

getCurrentUserIdRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('/api/current-user-id', async ({ headers }) => {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new Response('Not authenticated', { status: 401 });
  }
  const userId = session.user.id;
  // console.log('User ID: ', userId);
  return userId;
});