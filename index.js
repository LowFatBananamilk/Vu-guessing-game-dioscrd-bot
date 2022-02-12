const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');

const allIntents = new Intents(32767);
const discordClient = new Client({ intents: allIntents });

const user_scores_path = './datas/user_scores.json';
const server_settings_path = './datas/server_settings.json';
if (!fs.existsSync(user_scores_path)) {
	console.log(`There is no "${user_scores_path}". This might mean the data might have been lost!!`);
	fs.writeFileSync(user_scores_path, JSON.stringify({}, null, '\t'));
	console.log('Created a new file..');
}
if (!fs.existsSync(server_settings_path)) {
	console.log(`There is no "${server_settings_path}. This might mean the data might have been lost!!`);
	fs.writeFileSync(server_settings_path, JSON.stringify({}, null, '\t'));
	console.log('Created a new file..');
}

discordClient.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	discordClient.commands.set(command.data.name, command);
}

discordClient.once('ready', () => {
	console.log('Ready!');
});

discordClient.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = discordClient.commands.get(interaction.commandName);

		if (!command)
			return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

discordClient.login("OTM1ODc0MTA4NDE4MzIyNDUy.YfE-rw.CXX4Zi7MP9OjqY97bm-h3tVLLWM");
