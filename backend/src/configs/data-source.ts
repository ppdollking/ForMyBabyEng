import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// TypeORM CLI 실행 시 NODE_ENV 기반으로 env 파일 로드
const env = process.env.NODE_ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `../config/env/.${env}.env`) });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: env === 'local',
  entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
});
