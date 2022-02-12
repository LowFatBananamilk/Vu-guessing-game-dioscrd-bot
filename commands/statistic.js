const { SlashCommandBuilder } = require('@discordjs/builders');
const statisticEmbed = require('../shared/statisticEmbed');

const servers = require('../datas/server_settings.json');
const scores = require('../datas/user_scores.json');
let text;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statistic')
        .setDescription('View statistic for the number guessing game on this server')
        .addUserOption(option => option.setName('user').setDescription('Defaults to you!')),

    execute(interaction) {
        if (!servers[interaction.guildId]) {
            const { guess } = require('../translations/en.json');
            text = guess;
        }
        else {
            const { guess } = require(`../translations/${servers[interaction.guildId].language}.json`);
            text = guess;
        }

        if (interaction.options.data.length == 0) {
            if (scores[interaction.member.id] && scores[interaction.member.id][interaction.guildId])
                interaction.reply({ embeds: [statisticEmbed.getEmbed(interaction.member, scores[interaction.member.id][interaction.guildId], text.statisticEmbed)] });
            else
                interaction.reply(text.player_did_not_played_yet);
        }
        else {
            const user = interaction.options.getUser('user');
            if (scores[user.id] && scores[user.id][interaction.guildId])
                interaction.reply({ embeds: [statisticEmbed.getEmbed(user, scores[user.id][interaction.guildId], text.statisticEmbed)] });
            else
                interaction.reply(text.user_did_not_played_yet.replace("<user>", user.displayName));
        }
    }
}