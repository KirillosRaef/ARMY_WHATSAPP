import { createAuthClient } from "better-auth/client";
import type { auth } from "./\auth.ts";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { ip } from "./auth.ts";


export const authClient = createAuthClient({
    baseURL: `https://${ip}:3000`,
    plugins: [inferAdditionalFields<typeof auth>()],
});
