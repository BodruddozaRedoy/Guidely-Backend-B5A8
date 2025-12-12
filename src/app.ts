import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://guidely-frontend-b5-a8.vercel.app",
      ],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/api", router);

  // 404 + error handler (global)
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
