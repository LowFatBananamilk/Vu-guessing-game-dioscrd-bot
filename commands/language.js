const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const servers = require('../datas/server_settings.json');

const translationFiles = fs.readdirSync('./translations').filter((file) => file.endsWith('.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription("Change bot's language on the server.")
    .addStringOption((option) => {
      option.setName('option').setDescription('Language to set to').setRequired(true);

      // eslint-disable-next-line no-restricted-syntax
      for (const file of translationFiles) {
        if (file !== 'language_file_template.json') {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          const { name } = require(`../translations/${file}`);
          option.addChoice(name, file.substring(0, file.length - 5));
        }
      }
      return option;
    }),

  execute(interaction) {
    const language = interaction.options.getString('option');

    if (!servers[interaction.guildId]) {
      servers[interaction.guildId] = {};
    }
    servers[interaction.guildId].language = language;
    fs.writeFileSync('./datas/server_settings.json', JSON.stringify(servers, null, '\t'));

    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { language: text } = require(`../translations/${language}.json`);
    interaction.reply(text.set);
  },
};
