import { Elysia } from "elysia";
import { sql} from "drizzle-orm";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { signUpRoute } from "./routes/user/signUpRoute";
import { loginRoute } from "./routes/user/loginRoute";
import { deleteUsersRoute } from "./routes/user/deleteUsersRoute";
import { getUsersRoute } from "./routes/user/getUsersRoute";
import { getCurrentUserIdRoute } from "./routes/user/getCurrentUserIdRoute";
import { getCurrentUserRoleRoute } from "./routes/user/getCurrentUserRoleRoute";
import { conversationRoute } from "./routes/conversation/conversationRoute";
import { conversationMembersRoute } from "./routes/conversation/conversationMembersRoute";
import { messageRoute } from "./routes/conversation/messageRoute";
import { getConversationsRoute } from "./routes/conversation/getConversationsRoute";
import { deleteConversationsRoute } from "./routes/conversation/deleteConversationsRoute";
import { getConversationMembersRoute } from "./routes/conversation/getConversationMembersRoute.ts";
import { getConversationsByUserIdRoute } from "./routes/conversation/conversationsByUserIdRoute.ts";
import { ip } from "./auth.ts";
import { addConversationByNumberRoute } from "./routes/conversation/addConversationByNumberRoute.ts";
import { deleteConversationMembersRoute } from "./routes/conversation/deleteConversationMembersRoute.ts";

export function lower(email: SQLiteColumn): any {
  return sql`lower(${email})`;
}

const app = new Elysia()
  .use(cors({
    origin: `http://${ip}:5173`,
  }))
  .use(staticPlugin({
    assets: 'images',
    prefix: '/images',
  }))
  .use(signUpRoute)
  .use(loginRoute)
  .use(deleteUsersRoute)
  .use(getUsersRoute)
  .use(getCurrentUserIdRoute)
  .use(getCurrentUserRoleRoute)
  .use(conversationRoute)
  .use(conversationMembersRoute)
  .use(messageRoute)
  .use(getConversationsRoute)
  .use(deleteConversationsRoute)
  .use(getConversationMembersRoute)
  .use(getConversationsByUserIdRoute)
  .use(addConversationByNumberRoute)
  .use(deleteConversationMembersRoute);

app.listen({
  port: 3000,
  hostname: ip,
}, () => {
  console.log(`Server running at http://${ip}:3000`);
});

