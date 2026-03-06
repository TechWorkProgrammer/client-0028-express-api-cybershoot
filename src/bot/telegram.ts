import TelegramBot from "node-telegram-bot-api";
import {Env} from "../config/env";
import {logger} from "../config/logger";
import {login, register} from "../services/auth.service";
import {getUser} from "../services/user.service";

const GAME_NAME = Env.TELEGRAM_GAME_SHORT_NAME;

const queries: Record<string, TelegramBot.CallbackQuery> = {};

export const telegramBot = new TelegramBot(Env.TELEGRAM_BOT_TOKEN, {
    polling: true,
});


telegramBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/start msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);
    const firstName = msg.from?.first_name || "Player";

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            `👋 Hi *${firstName}*! Welcome to *CyberShoot*!\n\n` +
            "🎯 Next-Gen Web3 FPS Play-to-Earn Game\n\n" +
            "Dominate the battlefield and earn $CYBERS tokens!\n\n" +
            "*📋 Quick Start:*\n" +
            "1️⃣ /register - Create your account\n" +
            "2️⃣ /game - Start playing\n" +
            "3️⃣ /help - View all commands\n\n" +
            "Ready to shoot your way to victory? 🚀",
            {parse_mode: "Markdown"}
        );
    } else {
        await telegramBot.sendMessage(
            chatId,
            `🎮 Welcome back, *${user.username}*!\n\n` +
            `💰 Total Score: *${user.total_score}* $CYBERS\n\n` +
            "*⚡ Quick Actions:*\n" +
            "• /game - Play now\n" +
            "• /score - Check stats\n" +
            "• /ranking - View leaderboard\n" +
            "• /help - All commands\n\n" +
            "Let's dominate the battlefield! 🔥",
            {parse_mode: "Markdown"}
        );
    }
});

telegramBot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/help msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "📚 *CyberShoot Bot Commands*\n\n" +
        "*🎮 Main Menu*\n" +
        "• /start - Start bot\n" +
        "• /help - Help & commands\n" +
        "• /game - Play game\n" +
        "• /register - Create account\n\n" +
        "*💰 Score Menu*\n" +
        "• /score - Check $CYBERS score\n" +
        "• /score\\_history - Score history\n" +
        "• /score\\_stats - Score statistics\n" +
        "• /score\\_compare - Compare scores\n\n" +
        "*👤 Profile Menu*\n" +
        "• /profile - View profile\n" +
        "• /edit\\_profile - Edit profile\n" +
        "• /change\\_name - Change username\n\n" +
        "*🏆 Ranking Menu*\n" +
        "• /ranking - Leaderboard\n" +
        "• /ranking\\_global - Global rankings\n" +
        "• /ranking\\_friend - Friend rankings\n\n" +
        "*ℹ️ Other Menu*\n" +
        "• /info\\_game - Game info\n" +
        "• /feedback - Send feedback\n\n" +
        "*💡 Tips:*\n" +
        "• Use /register before playing\n" +
        "• Use /score @username to check other player's score\n" +
        "• Join esports competition for $100K prize pool!",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/register msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (user) {
        await telegramBot.sendMessage(
            chatId,
            "✅ You're already registered!\n\n" +
            `Username: *${user.username}*\n` +
            `Total Score: *${user.total_score}* $CYBERS\n\n` +
            "Use /game to start playing!",
            {parse_mode: "Markdown"}
        );
        return;
    }

    const ask = await telegramBot.sendMessage(
        chatId,
        "🎮 *Welcome to CyberShoot!*\n\n" +
        "Let's create your account.\n\n" +
        "Please reply to this message with your desired *username*.\n\n" +
        "⚠️ Username must be unique and 3-20 characters!",
        {parse_mode: "Markdown"}
    );

    telegramBot.onReplyToMessage(chatId, ask.message_id, async (reply) => {
        const username = reply.text;

        if (!username || username.length < 3 || username.length > 20) {
            await telegramBot.sendMessage(
                chatId,
                "❌ Invalid username! Must be 3-20 characters."
            );
            return;
        }

        register(chatId, username);

        await telegramBot.sendMessage(
            chatId,
            "🎉 *Registration Successful!*\n\n" +
            `Welcome, *${username}*!\n\n` +
            "You're now ready to earn $CYBERS tokens!\n\n" +
            "*Next Steps:*\n" +
            "• /game - Start playing\n" +
            "• /profile - View your profile\n" +
            "• /help - View all commands\n\n" +
            "Good luck in the battlefield! 🔫🚀",
            {parse_mode: "Markdown"}
        );
    });
});

telegramBot.onText(/\/game/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/game msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "🎮 *Welcome to CyberShoot!*\n\n" +
            "You need to register first before playing.\n\n" +
            "Use /register to create your account and start earning $CYBERS!\n\n" +
            "*Quick Start:*\n" +
            "1️⃣ /register - Create account\n" +
            "2️⃣ /game - Play and earn\n" +
            "3️⃣ /score - Check earnings",
            {parse_mode: "Markdown"}
        );
        return;
    }

    if (Env.APP_ENV === "development") {
        const askAccessTokenExpiresIn = await telegramBot.sendMessage(
            chatId,
            "🔧 *Development Mode*\n\n" +
            "Please enter access token expires in (m) by replying to this message.\n" +
            "Default: 60m",
            {parse_mode: "Markdown"}
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
                    "Please enter refresh token expires in (d) by replying to this message.\n" +
                    "Default: 1d"
                );

                let refreshTokenExpiresIn = 1;

                telegramBot.onReplyToMessage(
                    chatId,
                    askRefreshTokenExpiresIn.message_id,
                    async (reply) => {
                        if (reply.text) {
                            refreshTokenExpiresIn = parseInt(reply.text);
                        }

                        const tokens = await login(
                            user.id,
                            `${accessTokenExpiresIn}m`,
                            `${refreshTokenExpiresIn}d`
                        );

                        if (!tokens) {
                            await telegramBot.sendMessage(chatId, "❌ Login failed.");
                            return;
                        }

                        await telegramBot.sendMessage(
                            chatId,
                            `✅ Access token (${accessTokenExpiresIn}m):\n\`${tokens.accessToken}\``,
                            {parse_mode: "Markdown"}
                        );
                        await telegramBot.sendMessage(
                            chatId,
                            `✅ Refresh token (${refreshTokenExpiresIn}d):\n\`${tokens.refreshToken}\``,
                            {parse_mode: "Markdown"}
                        );
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

// ========== SCORE MENU ==========

telegramBot.onText(/\/score(@\w+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const targetUsername = match?.[1]?.substring(1); // Remove @ symbol

    logger.info(`/score msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ You haven't registered yet!\n\n" +
            "Use /register to create an account and start playing!"
        );
        return;
    }

    // Check if user is asking for someone else's score
    if (targetUsername) {
        await telegramBot.sendMessage(
            chatId,
            "🔍 *Player Score Check*\n\n" +
            `Looking up score for: @${targetUsername}\n\n` +
            "⚠️ This feature is coming soon!\n" +
            "Currently, you can only check your own score.\n\n" +
            "Use /score to check your stats.",
            {parse_mode: "Markdown"}
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "🏆 *Your Stats*\n\n" +
        `Player: *${user.username}*\n` +
        `💰 Total Score: *${user.total_score}* $CYBERS\n\n` +
        "*📊 Quick Stats:*\n" +
        "• Games Played: Coming soon\n" +
        "• Win Rate: Coming soon\n" +
        "• Best Streak: Coming soon\n\n" +
        "Keep playing to earn more $CYBERS! 🚀\n\n" +
        "_Use /score\\_history to see detailed history_",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/score_history/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/score_history msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first to view score history!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "📊 *Score History*\n\n" +
        `Player: *${user.username}*\n\n` +
        "⚠️ *Coming Soon!*\n" +
        "This feature is under development.\n\n" +
        "You'll soon be able to see:\n" +
        "• Daily earnings\n" +
        "• Weekly performance\n" +
        "• Monthly statistics\n" +
        "• Game-by-game breakdown\n\n" +
        "Stay tuned! 🚀",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/score_stats/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/score_stats msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first to view statistics!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "📈 *Detailed Statistics*\n\n" +
        `Player: *${user.username}*\n` +
        `Total Score: *${user.total_score}* $CYBERS\n\n` +
        "⚠️ *Advanced Stats Coming Soon!*\n\n" +
        "Future stats will include:\n" +
        "• K/D Ratio\n" +
        "• Accuracy %\n" +
        "• Favorite Weapon\n" +
        "• Average Score per Game\n" +
        "• Total Playtime\n" +
        "• Headshot Percentage\n\n" +
        "Keep grinding! 💪",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/score_compare/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/score_compare msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first to compare scores!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "⚔️ *Compare Scores*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Soon you'll be able to:\n" +
        "• Compare with friends\n" +
        "• See side-by-side stats\n" +
        "• Challenge other players\n" +
        "• View skill differences\n\n" +
        "For now, check /ranking to see top players!",
        {parse_mode: "Markdown"}
    );
});

// ========== PROFILE MENU ==========

telegramBot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/profile msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first to view your profile!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "👤 *Your Profile*\n\n" +
        `🎮 Username: *${user.username}*\n` +
        `🆔 Player ID: \`${user.id}\`\n` +
        `💰 Total Score: *${user.total_score}* $CYBERS\n` +
        `📅 Joined: Member since registration\n\n` +
        "*🎯 Profile Stats:*\n" +
        "• Games Played: Coming soon\n" +
        "• Win Rate: Coming soon\n" +
        "• Rank: Coming soon\n\n" +
        "*⚙️ Profile Options:*\n" +
        "• /edit\\_profile - Edit profile\n" +
        "• /change\\_name - Change username\n\n" +
        "Keep dominating! 🔥",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/edit_profile/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/edit_profile msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "⚙️ *Edit Profile*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Future edit options:\n" +
        "• Change bio\n" +
        "• Set favorite weapon\n" +
        "• Update privacy settings\n" +
        "• Customize profile badge\n\n" +
        "Currently available:\n" +
        "• /change\\_name - Change username",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/change_name/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/change_name msg: ${JSON.stringify(msg)}`);

    const user = await getUser(chatId);

    if (!user) {
        await telegramBot.sendMessage(
            chatId,
            "❌ Please /register first!"
        );
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        "✏️ *Change Username*\n\n" +
        `Current username: *${user.username}*\n\n` +
        "⚠️ *Coming Soon!*\n\n" +
        "Username change feature is under development.\n" +
        "Soon you'll be able to change your display name!\n\n" +
        "_Note: Some restrictions may apply (cooldown period, etc.)_",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/change_avatar/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/change_avatar msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "🖼️ *Change Avatar*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Avatar customization will be available soon!\n\n" +
        "Future options:\n" +
        "• Upload custom avatar\n" +
        "• Choose from NFT collection\n" +
        "• Unlock special avatars\n" +
        "• Animated profile pictures\n\n" +
        "Stay tuned! 🎨",
        {parse_mode: "Markdown"}
    );
});

// ========== RANKING MENU ==========

telegramBot.onText(/\/ranking$/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/ranking msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "🏆 *Leaderboard*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "The global leaderboard is under construction!\n\n" +
        "*Future Features:*\n" +
        "• Top 100 players\n" +
        "• Daily/Weekly/Monthly rankings\n" +
        "• Your current rank\n" +
        "• $CYBERS earnings leaderboard\n\n" +
        "*Available Commands:*\n" +
        "• /ranking\\_global - Global rankings\n" +
        "• /ranking\\_friend - Friend rankings\n\n" +
        "Keep playing to secure your spot! 💪",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/ranking_global/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/ranking_global msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "🌍 *Global Rankings*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Global leaderboard will show:\n" +
        "• Top 100 worldwide players\n" +
        "• Total $CYBERS earned\n" +
        "• Win rate statistics\n" +
        "• Country rankings\n\n" +
        "Compete for the $100K esports prize pool! 🏆",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/ranking_friend/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/ranking_friend msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "👥 *Friend Rankings*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Friend leaderboard features:\n" +
        "• Compare with Telegram friends\n" +
        "• See who's earning most $CYBERS\n" +
        "• Challenge friends to matches\n" +
        "• Private friend groups\n\n" +
        "Invite friends to compete! 🎮",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/ranking_clan/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/ranking_clan msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "⚔️ *Clan Rankings*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "Clan system features:\n" +
        "• Create or join clans\n" +
        "• Clan vs Clan battles\n" +
        "• Shared $CYBERS rewards\n" +
        "• Clan leaderboards\n" +
        "• Clan tournaments\n\n" +
        "Team up for victory! 🛡️",
        {parse_mode: "Markdown"}
    );
});

// ========== OTHER MENU ==========

telegramBot.onText(/\/info_game/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/info_game msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "ℹ️ *CyberShoot Game Info*\n\n" +
        "🎮 *About CyberShoot*\n" +
        "Next-Gen Web3 FPS Play-to-Earn Game\n\n" +
        "*💰 Earn $CYBERS by:*\n" +
        "• Winning battles\n" +
        "• Completing missions\n" +
        "• Ranking on leaderboards\n\n" +
        "*🎯 Key Features:*\n" +
        "• Competitive PvP battles\n" +
        "• NFT weapons & skins\n" +
        "• $100K esports prize pool\n" +
        "• Cross-platform play\n\n" +
        "*📱 Available On:*\n" +
        "• Amazon App Store ✅\n" +
        "• Play Store (Coming soon)\n" +
        "• App Store (Coming soon)\n\n" +
        "*🔗 Links:*\n" +
        "Website: https://cybershoot.lorai.app\n" +
        "Twitter: @cybershoot\\_\n" +
        "Telegram: @CyberShootCommunity\n\n" +
        "Monthly Players: 19,819+\n" +
        "Total Supply: 1B $CYBERS",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/update/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/update msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "🔄 *Update Data*\n\n" +
        "⚠️ *Coming Soon!*\n\n" +
        "This will allow you to:\n" +
        "• Sync game progress\n" +
        "• Refresh leaderboards\n" +
        "• Update token balance\n" +
        "• Reload player stats\n\n" +
        "For now, your data updates automatically! ✅",
        {parse_mode: "Markdown"}
    );
});

telegramBot.onText(/\/feedback/, async (msg) => {
    const chatId = msg.chat.id;
    logger.info(`/feedback msg: ${JSON.stringify(msg)}`);

    await telegramBot.sendMessage(
        chatId,
        "💬 *Send Feedback*\n\n" +
        "We'd love to hear from you!\n\n" +
        "*How to submit feedback:*\n" +
        "1. Join our Telegram community\n" +
        "2. Share your thoughts\n" +
        "3. Report bugs or suggestions\n\n" +
        "*Community Links:*\n" +
        "📱 Telegram: @CyberShootCommunity\n" +
        "🐦 Twitter: @cybershoot\\_\n" +
        "💬 Discord: discord.gg/cybershoot\n\n" +
        "Your feedback helps us improve! 🚀",
        {parse_mode: "Markdown"}
    );
});

// ========== CALLBACK QUERY & INLINE ==========

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
