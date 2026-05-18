import { createAuthClient } from "better-auth/client";
import type { auth } from "./\auth.ts";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { ip } from "./index.ts";


export const authClient = createAuthClient({
    baseURL: `http://${ip}:3000`,
    plugins: [inferAdditionalFields<typeof auth>()],
});
