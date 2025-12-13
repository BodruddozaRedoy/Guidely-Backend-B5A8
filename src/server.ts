// src/server.ts
import { createApp } from "./app";
import { initializeAdmin } from "./config/adminInit";
import { env } from "./config/env";

async function startServer() {
  try {
    // Initialize admin account on server start
    await initializeAdmin();

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();