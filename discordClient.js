const { Client, Collection, Intents } = require('discord.js');

const allIntents = new Intents(32767);
const DiscordClient = new Client({ intents: allIntents });

module.exports = { DiscordClient, Collection };
