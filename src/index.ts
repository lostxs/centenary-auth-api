import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";

const PORT = process.env.PORT || 3000;
const origins = process.env.ORIGINS.split(",");

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: origins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

Bun.serve({
  port: PORT,
  fetch: app.fetch,
});

if (process.env.NODE_ENV === "development") {
  console.log(`💕 Server is running at http://localhost:${PORT}`);
}
