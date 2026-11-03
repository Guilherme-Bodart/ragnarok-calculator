import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

function resolveAllowedOrigins(): (string | RegExp)[] {
  const raw = process.env.WEB_ORIGIN || process.env.FRONTEND_URL || "";
  const configured = raw
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [
    ...configured,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    /\.vercel\.app$/,
  ];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: resolveAllowedOrigins(),
  });
  app.setGlobalPrefix("api");

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
}

void bootstrap();
