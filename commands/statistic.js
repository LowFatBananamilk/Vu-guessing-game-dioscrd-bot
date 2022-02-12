const { SlashCommandBuilder } = require('@discordjs/builders');
const statisticEmbed = require('../shared/statisticEmbed');

const servers = require('../datas/server_settings.json');
const scores = require('../datas/user_scores.json');

let text;
let statisticEmbedTemplate;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statistic')
    .setDescription('View statistic for the number guessing game on this server')
    .addUserOption((option) => option.setName('user').setDescription('Defaults to you!')),

  async execute(interaction) {
    if (!servers[interaction.guildId]) {
      // eslint-disable-next-line global-require
      const { statistic, statisticEmbed: localStatisticEmbedTemplate } = require('../translations/en.json');
      text = statistic;
      statisticEmbedTemplate = localStatisticEmbedTemplate;
    } else {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const { statistic, statisticEmbed: localStatisticEmbedTemplate } = require(`../translations/${servers[interaction.guildId].language}.json`);
      text = statistic;
      statisticEmbedTemplate = localStatisticEmbedTemplate;
    }

    if (interaction.options.data.length === 0) {
      if (scores[interaction.member.id] && scores[interaction.member.id][interaction.guildId]) {
        const embed = await statisticEmbed.getEmbed(
          interaction.member,
          scores[interaction.member.id][interaction.guildId],
          statisticEmbedTemplate,
        );
        interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply(text.player_did_not_played_yet);
      }
    } else {
      const user = interaction.options.getUser('user');

      if (scores[user.id] && scores[user.id][interaction.guildId]) {
        const embed = await statisticEmbed.getEmbed(
          user,
          scores[user.id][interaction.guildId],
          statisticEmbedTemplate,
        );
        interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply(text.user_did_not_played_yet.replace('<user>', user.displayName));
      }
    }
  },
};
