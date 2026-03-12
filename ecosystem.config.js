module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/main.js',
      cwd: './backend',
      // pm2 start ecosystem.config.js             → local 환경
      // pm2 start ecosystem.config.js --env live  → live 환경
      env: {
        NODE_ENV: 'local',
      },
      env_live: {
        NODE_ENV: 'live',
      },
    },
    {
      name: 'frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './frontend',
      // next start 전에 반드시 next build 실행 필요
      env: {
        APP_ENV: 'local',
      },
      env_live: {
        APP_ENV: 'live',
      },
    },
  ],
};
