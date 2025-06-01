export const Env = {
  APP_ENV: process.env.APP_ENV!,
  APP_PORT: process.env.APP_PORT!,
  APP_URL: process.env.APP_URL!,

  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_ACCESS_EXP_MINUTES: process.env.JWT_ACCESS_EXP_MINUTES!,
  JWT_REFRESH_EXP_DAYS: process.env.JWT_REFRESH_EXP_DAYS!,

  OBFUSCATION_KEY: process.env.OBFUSCATION_KEY!,
};
