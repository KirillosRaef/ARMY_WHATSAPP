import { Elysia, t } from "elysia";
import { db } from "../../database";
import { conversation } from "../../schema";
export const getConversationsRoute = new Elysia()

getConversationsRoute.onError(({ error }) => {
  console.log(error);
  return error;
}).get('api/conversations', () => {
  return db.select({
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    createdById: conversation.createdById,
    image: conversation.image,
  }).from(conversation);
});