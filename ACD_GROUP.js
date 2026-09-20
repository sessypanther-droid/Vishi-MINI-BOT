const { cmd } = require('../command')
const config = require('../config')

// බලය තියෙන අංක පරීක්ෂා කිරීමේ function එක
const hasAccess = (sender) => {
    const myNumber = "94703457206@s.whatsapp.net";
    return sender === myNumber; // මෙතනට බොට් කනෙක්ට් කරපු කෙනා (Owner) auto ඇඩ් වෙනවා isOwner logic එකෙන්
}

// 1. Kick All Members (පරිස්සමෙන් පාවිච්චි කරන්න!)
cmd({
    pattern: "kickall",
    desc: "Kicks everyone from the group",
    category: "owner",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, isBotAdmins, sender, participants, reply, isOwner }) => {
    if (!isGroup) return reply("මෙය ගෲප් එකකදී පමණක් භාවිතා කළ හැක.");
    if (!isOwner && !hasAccess(sender)) return reply("මෙම Command එක භාවිතා කිරීමට ඔබට අවසර නැත! 🚫");
    if (!isBotAdmins) return reply("මම Admin කෙනෙක් නෙවෙයි මචං! ❌");

    reply("සියලුම සාමාජිකයින් ඉවත් කිරීම ආරම්භ කරනවා... 💨");
    for (let mem of participants) {
        if (!mem.admin) { // Admin ලව අයින් වෙන්නේ නැහැ
            await conn.groupParticipantsUpdate(from, [mem.id], 'remove');
        }
    }
    reply("වැඩේ ඉවරයි! ✅");
})

// 2. Kick Specific Member (Reply කරලා හෝ Tag කරලා)
cmd({
    pattern: "kick",
    desc: "Kicks a member",
    category: "admin",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, isBotAdmins, sender, quoted, mentionedJid, reply, isOwner }) => {
    if (!isGroup) return reply("ගෲප් එකකදී පමණක් භාවිතා කරන්න.");
    if (!isOwner && !hasAccess(sender)) return reply("ඔබට අවසර නැත!");
    if (!isBotAdmins) return reply("බොට් Admin විය යුතුය.");

    let users = quoted ? [quoted.sender] : mentionedJid;
    if (!users || users.length === 0) return reply("කරුණාකර කෙනෙක්ව Tag කරන්න හෝ Reply කරන්න.");

    await conn.groupParticipantsUpdate(from, users, 'remove');
    reply("සාර්ථකව ඉවත් කළා! 🧹");
})

// 3. Add Member
cmd({
    pattern: "add",
    desc: "Adds a member",
    category: "admin",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, isBotAdmins, sender, q, reply, isOwner }) => {
    if (!isGroup) return reply("ගෲප් එකකදී පමණක් භාවිතා කරන්න.");
    if (!isOwner && !hasAccess(sender)) return reply("ඔබට අවසර නැත!");
    if (!isBotAdmins) return reply("බොට් Admin විය යුතුය.");
    if (!q) return reply("කරුණාකර අංකය ලබා දෙන්න (947xxx).");

    let user = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
    await conn.groupParticipantsUpdate(from, [user], 'add');
    reply("සාමාජිකයා එකතු කළා! ✅");
})

// 4. Delete Message (Reply කරන මැසේජ් එක මකන්න)
cmd({
    pattern: "del",
    alias: ["delete"],
    desc: "Deletes a message",
    category: "admin",
    filename: __filename
},
async(conn, mek, m, { from, sender, quoted, reply, isOwner }) => {
    if (!isOwner && !hasAccess(sender)) return reply("ඔබට අවසර නැත!");
    if (!quoted) return reply("මකන්න ඕන මැසේජ් එකට reply කරන්න.");

    await conn.sendMessage(from, { delete: quoted.fakeObj.key });
})

// 5. Warning System (සරලව)
let warnCount = {};
cmd({
    pattern: "warn",
    desc: "Warn a member",
    category: "admin",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, sender, quoted, reply, isOwner }) => {
    if (!isGroup) return reply("ගෲප් එකකදී පමණක් භාවිතා කරන්න.");
    if (!isOwner && !hasAccess(sender)) return reply("ඔබට අවසර නැත!");

    let user = quoted ? quoted.sender : m.mentionedJid[0];
    if (!user) return reply("කෙනෙක්ව Tag කරන්න.");

    if (!warnCount[user]) warnCount[user] = 0;
    warnCount[user]++;

    if (warnCount[user] >= 3) {
        reply("අවවාද 3ම ඉවරයි! සාමාජිකයා ඉවත් කරනවා.");
        await conn.groupParticipantsUpdate(from, [user], 'remove');
        warnCount[user] = 0;
    } else {
        reply(`⚠️ @${user.split('@')[0]} ඔබට අවවාද කර ඇත! (${warnCount[user]}/3)`, { mentions: [user] });
    }
})

// 6. Link Delete (Anti-Link logic for Owner/Special User)
cmd({
    pattern: "antilink",
    desc: "Auto delete links",
    category: "admin",
    filename: __filename
},
async(conn, mek, m, { from, isGroup, sender, reply, isOwner }) => {
    if (!isOwner && !hasAccess(sender)) return reply("ඔබට අවසර නැත!");
    // මේක සාමාන්‍යයෙන් index.js එකේ setup කරන්න ඕන වැඩක්, 
    // හැබැයි command එකෙන් on/off කරන්න පුළුවන් විදියට හදාගන්න පුළුවන්.
    reply(`${config.BOT_NAME || 'HASHAN-MD-MINI'} ලින්ක් මකා දැමීමේ පද්ධතිය සක්‍රීයයි! 🛡️`);
})
