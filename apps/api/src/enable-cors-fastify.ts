import Fastify, { type FastifyPluginAsync } from "fastify";
import fastifyCors from "@fastify/cors";
// Inline minimal admin routes plugin (replace with your real plugin or file path)
const adminRoutes: FastifyPluginAsync = async (fastify, opts) => {
  void opts;
  fastify.get("/", async () => ({ message: "admin root" }));
};

async function start() {
  const app = Fastify();

  // register CORS plugin (await inside start avoids top-level await)
  await app.register(fastifyCors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  });

  // register your existing admin routes as a plugin (Fastify style)
  // If your routes are an Express-style router, keep using Express version above.
  app.register(adminRoutes, { prefix: "/admin" });

  const PORT = Number(process.env.PORT ?? 4000);
  await app.listen({ port: PORT });
  console.log(`API server listening on http://localhost:${PORT}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});