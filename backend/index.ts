import { Elysia } from "elysia";
import { sql} from "drizzle-orm";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import fs from 'fs';
import path from 'path';
import { ip } from "./auth.ts";
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
import { addConversationByNumberRoute } from "./routes/conversation/addConversationByNumberRoute.ts";
import { deleteConversationMembersRoute } from "./routes/conversation/deleteConversationMembersRoute.ts";
import { deleteAllConversationsRoute } from "./routes/conversation/deleteAllRoutes.ts";
import { getCurrentUserConversationsRoute } from "./routes/conversation/getCurrentUserConversationsRoute.ts";
import { getCurrentUserRoute } from "./routes/user/getCurrentUserRoute.ts";
import { getMessagesByConversationRoute } from "./routes/conversation/getMessagesByConversationRoute.ts";
import { messageWebSocketRoute } from "./routes/ws/messageWebSocketRoute.ts";
import { imageRoute } from "./routes/attachment/imageRoute.ts";
import { documentRoute } from "./routes/attachment/documentRoute.ts";
import { audioRoute } from "./routes/attachment/audioRoute.ts";
import { videoRoute } from "./routes/attachment/videoRoute.ts";
import { callSignalingRoute } from "./routes/ws/callSignalingRoute.ts";
import { conversationNotifyRoute } from "./routes/ws/conversationNotifyRoute.ts";
import { markConversationReadRoute } from "./routes/conversation/markConversationReadRoute.ts";

export function lower(email: SQLiteColumn): any {
  return sql`lower(${email})`;
}

const app = new Elysia()
  .use(cors({
    origin: true,
  }))
  .use(staticPlugin({
    assets: 'attachments',
    prefix: '/attachments',
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
  .use(deleteConversationMembersRoute)
  .use(deleteAllConversationsRoute)
  .use(getCurrentUserConversationsRoute)
  .use(getCurrentUserRoute)
  .use(getMessagesByConversationRoute)
  .use(messageWebSocketRoute)
  .use(imageRoute)
  .use(documentRoute)
  .use(audioRoute)
  .use(videoRoute)
  .use(callSignalingRoute)
  .use(conversationNotifyRoute)
  .use(markConversationReadRoute);

// Load self-signed certificates
const certsDir = path.resolve(import.meta.dir, '../certs');
const tlsConfig = fs.existsSync(path.join(certsDir, 'server-key.pem'))
  ? {
      key: Bun.file(path.join(certsDir, 'server-key.pem')),
      cert: Bun.file(path.join(certsDir, 'server.pem')),
    }
  : undefined;

app.listen({
  port: 3000,
  hostname: ip,
  tls: tlsConfig,
}, () => {
  const protocol = tlsConfig ? 'https' : 'http';
  console.log(`Server running at ${protocol}://${ip}:3000`);
});

