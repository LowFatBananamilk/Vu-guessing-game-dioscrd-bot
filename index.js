const fs = require('fs');
const { DiscordClient, Collection } = require('./discordClient');

const userScoresPath = './datas/user_scores.json';
const serverSettingsPath = './datas/server_settings.json';

if (!fs.existsSync(userScoresPath)) {
  console.log(`There is no "${userScoresPath}". This might mean the data might have been lost!!`);
  fs.writeFileSync(userScoresPath, JSON.stringify({}, null, '\t'));
  console.log('Created a new file..');
}
if (!fs.existsSync(serverSettingsPath)) {
  console.log(`There is no "${serverSettingsPath}. This might mean the data might have been lost!!`);
  fs.writeFileSync(serverSettingsPath, JSON.stringify({}, null, '\t'));
  console.log('Created a new file..');
}

DiscordClient.commands = new Collection();
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));
// eslint-disable-next-line no-restricted-syntax
for (const file of commandFiles) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const command = require(`./commands/${file}`);
  DiscordClient.commands.set(command.data.name, command);
}

DiscordClient.once('ready', () => {
  console.log('Ready!');
});

DiscordClient.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const command = DiscordClient.commands.get(interaction.commandName);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

DiscordClient.login(process.env.DISCORD_TOKEN);
