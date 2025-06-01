import TelegramBot from "node-telegram-bot-api";
import { Env } from "../config/env";
import { logger } from "../config/logger";
import { findUserById } from "../repositories/user.repositories";
import { login, register } from "../services/auth.service";
import { getUser } from "../services/user.service";

const GAME_NAME = "Cyber_Shoot";

const queries: Record<string, TelegramBot.CallbackQuery> = {};

export const telegramBot = new TelegramBot(Env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

telegramBot.onText(/\/register/, async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`/register msg: ${JSON.stringify(msg)}`);

  const user = await getUser(chatId);

  if (user) {
    await telegramBot.sendMessage(chatId, "You already registered.");
    return;
  }

  const ask = await telegramBot.sendMessage(
    chatId,
    "Please enter your username by replying to this message."
  );

  telegramBot.onReplyToMessage(chatId, ask.message_id, async (reply) => {
    const username = reply.text;

    if (!username) {
      await telegramBot.sendMessage(chatId, "Invalid username.");
      return;
    }

    await register(chatId, username);

    await telegramBot.sendMessage(chatId, "You are now registered.");
  });
});

telegramBot.onText(/\/score/, async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`/score msg: ${JSON.stringify(msg)}`);

  const user = findUserById(chatId);

  if (!user) {
    await telegramBot.sendMessage(chatId, "You never played the game.");
    return;
  }

  await telegramBot.sendMessage(chatId, `Your score is: ${user.total_score}`);
});

telegramBot.onText(/\/start|\/game/, async (msg) => {
  const chatId = msg.chat.id;

  logger.info(`/start|/game msg: ${JSON.stringify(msg)}`);

  const user = await getUser(chatId);

  if (!user) {
    await telegramBot.sendMessage(chatId, "Please register first.");
    return;
  }

  if (Env.APP_ENV === "development") {
    const askAccessTokenExpiresIn = await telegramBot.sendMessage(
      chatId,
      "Please enter access token expires in (m) by replying to this message. Default is (60m)"
    );

    let accessTokenExpiresIn = 60;

    telegramBot.onReplyToMessage(
      chatId,
      askAccessTokenExpiresIn.message_id,
      async (reply) => {
        if (reply.text) {
          accessTokenExpiresIn = parseInt(reply.text);
        }

        const askRefreshTokenExpiresIn = await telegramBot.sendMessage(
          chatId,
          "Please enter refresh token expires in (d) by replying to this message. Default is (1d)"
        );

        let refreshTokenExpiresIn = 1;

        telegramBot.onReplyToMessage(
          chatId,
          askRefreshTokenExpiresIn.message_id,
          async (reply) => {
            if (reply.text) {
              refreshTokenExpiresIn = parseInt(reply.text);

              const tokens = await login(
                user.id,
                `${accessTokenExpiresIn}m`,
                `${refreshTokenExpiresIn}d`
              );

              if (!tokens) {
                await telegramBot.sendMessage(chatId, "Login failed.");
                return;
              }

              await telegramBot.sendMessage(
                chatId,
                `Access token (${accessTokenExpiresIn}m): ${tokens.accessToken}`
              );
              await telegramBot.sendMessage(
                chatId,
                `Refresh token (${refreshTokenExpiresIn}d): ${tokens.refreshToken}`
              );

              return;
            }
          }
        );
      }
    );

    return;
  }

  await telegramBot.sendGame(chatId, GAME_NAME, {
    protect_content: true,
  });
});

telegramBot.on("callback_query", async (query: TelegramBot.CallbackQuery) => {
  if (query.game_short_name && query.game_short_name !== GAME_NAME) {
    await telegramBot.answerCallbackQuery(query.id, {
      text: "Sorry, '" + query.game_short_name + "' is not available.",
    });

    return;
  }

  if (query.game_short_name && query.game_short_name === GAME_NAME) {
    logger.info(`query.id: ${JSON.stringify(query)}`);

    queries[query.id] = query;

    const userId = query.from.id;

    const tokens = await login(userId);

    if (!tokens) {
      await telegramBot.answerCallbackQuery(query.id, {
        text: "Login failed.",
      });
      return;
    }

    await telegramBot.answerCallbackQuery(query.id, {
      url: `${Env.APP_URL}?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    });

    return;
  }
});

telegramBot.on("inline_query", async (query) => {
  logger.info(`inline_query: ${JSON.stringify(query)}`);
  await telegramBot.answerInlineQuery(query.id, [
    {
      type: "game",
      id: "0",
      game_short_name: GAME_NAME,
    },
  ]);
});
