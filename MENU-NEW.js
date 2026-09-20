const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require("axios");
const config = require('../config');
const { BOT_IMAGE } = require('../lib/bot-image');

cmd({
    pattern: "menu4",
    alias: ["list"],
    desc: "Show all commands",
    category: "main",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // --- Contact Card ---
        const number = "13135550002";
        const jid = number + "@s.whatsapp.net";
        let thumb = Buffer.from([]);
        try {
            const ppUrl = await conn.profilePictureUrl(jid, "image");
            const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" });
            thumb = Buffer.from(ppResp.data, "binary");
        } catch (err) {}

        const menuBotName = config.BOT_NAME || 'DCT AI';
        const contactCard = {
            key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: "status@broadcast" },
            message: {
                contactMessage: {
                    displayName: `${menuBotName} ✨`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${menuBotName}\nORG:${config.OWNER_NAME || 'Vishi'}\nTEL;type=CELL;type=VOICE;waid=${number}:+94 70 489 6880\nEND:VCARD`,
                    jpegThumbnail: thumb
                }
            }
        };

        // --- System Stats ---
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());

        // --- Menu Text Design ---
        let menuText = `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ✨ ${config.BOT_NAME || 'DTZ VISHI MD'} 𝐌𝐄𝐍𝐔 ✨  
┗━━━━━━━━━━━━━━━━━━━━┛
*👤 𝐎𝐖𝐍𝐄𝐑:*  ${config.OWNER_NAME || 'Vishi'}
*📡 𝐒𝐓𝐀𝐓𝐔𝐒:*  𝐎𝐍𝐋𝐈𝐍𝐄 🚀
*⌛ 𝐔𝐏𝐓𝐈𝐌𝐄:*  ${uptime}
*💾 𝐑𝐀𝐌:*      ${ramUsed}MB / ${ramTotal}MB
*👤 𝐔𝐒𝐄𝐑:*     @${m.sender.split('@')[0]}\n`;

        const categories = {};
        commands.forEach(cmd => {
            if (cmd.pattern && !cmd.dontAddCommandList) {
                if (!categories[cmd.category]) categories[cmd.category] = [];
                categories[cmd.category].push(cmd.pattern);
            }
        });

        // --- Category Loop with Separate Boxes ---
        for (const cat in categories) {
            menuText += `\n┏━━━━━━━━━━━━━━━━━━━━┓
┃ 📂 *${cat.toUpperCase()}*
┣━━━━━━━━━━━━━━━━━━━━┛`;
            categories[cat].forEach(cmdName => {
                menuText += `\n┃ ✦ ${cmdName.charAt(0).toUpperCase() + cmdName.slice(1)}`;
            });
            menuText += `\n┗━━━━━━━━━━━━━━━━━━━━┛`;
        }

        menuText += `\n\n*⚡ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 ${config.BOT_NAME || 'DTZ VISHI MD'}*`;

        // --- Final Send ---
        await conn.sendMessage(from, {
            image: BOT_IMAGE,
            caption: menuText,
            mentions: [m.sender],
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                businessMessageForwardInfo: { businessOwnerJid: '94704896880@s.whatsapp.net' }
            }
        }, { quoted: contactCard });

    } catch (err) {
        console.error("❌ Menu cmd error:", err);
        reply("❌ Error: " + err.message);
    }
});
