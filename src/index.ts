import { app } from "./app";
import { Env } from "./config/env";
import { logger } from "./config/logger";

app.listen(Env.APP_PORT, () =>
  logger.info(`Server running on port ${Env.APP_PORT}`)
);
