import { Elysia, t } from "elysia";
import { db } from "../../database";
import { user } from "../../schema";
export const getUsersRoute = new Elysia()

getUsersRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('api/users', () => {
  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    number: user.number,
    image: user.image, //TODO: ADD PROFILE IMAGE
  }).from(user);
});