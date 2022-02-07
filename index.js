const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const allIntents = new Intents(32767);
const client = new Client({ allIntents });

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);