const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

const allIntents = new Intents(32767);
const discordClient = new Client({ intents: allIntents });

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
	console.log(interaction);
	if (interaction.isCommand()){
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

discordClient.login(token);
