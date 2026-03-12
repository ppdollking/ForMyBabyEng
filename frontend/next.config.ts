import type { NextConfig } from "next";
import path from "path";
import * as dotenv from "dotenv";

const appEnv = process.env.APP_ENV || "local";
const envPath = path.resolve(__dirname, `src/config/env/.${appEnv}.env`);
const { parsed: envVars = {} } = dotenv.config({ path: envPath });

const nextConfig: NextConfig = {
  // Turbopack에 frontend 디렉토리를 root로 명시 → 상위 lockfile 혼동 방지
  turbopack: {
    root: path.resolve(__dirname),
  },
  env: envVars,
};

export default nextConfig;
