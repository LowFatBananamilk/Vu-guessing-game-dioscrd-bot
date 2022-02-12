const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const commandFiles = fs.readdirSync('./translations').filter(file => file.endsWith('.json'));
const servers = require('../datas/server_settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription("Change bot's language on the server.")
        .addStringOption(option => {
            option.setName('option').setDescription("test").setRequired(true);
            
            for (const file of commandFiles) {
                if (file != 'language_file_template.json') {
                    const { name } = require(`../translations/${file.substring(file.substring(0, file.length - 5))}`);
                    option.addChoice(name, file);
                }
            }
        }),

    execute(interaction) {
        const language = interaction.options.getUser('user');
        if (!servers[interaction.guildId])
            servers[interaction.guildId] = {};
        servers[interaction.guildId].language = language;
        fs.writeFileSync('./datas/server_settings.json', JSON.stringify(servers, null, '\t'));

        const { language: text } = require(`../translations/${language}.json`);
        interaction.reply(text.set);
    }
};