const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const statisticEmbed = require('../shared/statisticEmbed');

const servers = require('../datas/server_settings.json');
const scores = require('../datas/user_scores.json');

const count = 5;
const time = 60000;
const min = 1;
const max = 100;
const statisticsTemplate = {
  plays: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0],
};

let text;
let statisticEmbedTemplate;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Number guessing game'),

  execute(interaction) {
    if (!servers[interaction.guildId]) {
      // eslint-disable-next-line global-require
      const { guess, statisticEmbed: localStatisticEmbedTemplate } = require('../translations/en.json');
      text = guess;
      statisticEmbedTemplate = localStatisticEmbedTemplate;
    } else {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const { guess, statisticEmbed: localStatisticEmbedTemplate } = require(`../translations/${servers[interaction.guildId].language}.json`);
      text = guess;
      statisticEmbedTemplate = localStatisticEmbedTemplate;
    }

    interaction.reply(text.instruction);

    const answer = Math.floor(Math.random() * (max - min + 1)) + max;
    let tries = 0;
    if (process.env.environment === 'dev') {
      console.log(`The answer is ${answer}`);
    }

    if (!scores[interaction.member.id]) {
      scores[interaction.member.id] = {};
    }
    if (!scores[interaction.member.id][interaction.guildId]) {
      scores[interaction.member.id][interaction.guildId] = JSON.parse(
        JSON.stringify(statisticsTemplate),
      );
    }

    const statistic = scores[interaction.member.id][interaction.guildId];

    const filter = (m) => m.author.id === interaction.member.id;
    const collector = interaction.channel.createMessageCollector({ filter, time });

    collector.on('collect', async (m) => {
      if (process.env.environment === 'dev') {
        console.log(`Collected ${m.content}`);
      }

      const guess = parseInt(m.content, 10);
      if (Number.isNaN(guess)) {
        m.reply(text.read_fail);
      } else if (guess === answer) {
        statistic.wins += 1;
        statistic.currentStreak += 1;
        if (statistic.maxStreak < statistic.currentStreak) {
          statistic.maxStreak = statistic.currentStreak;
        }
        statistic.distribution[tries] += 1;
        collector.stop();

        const embed = await statisticEmbed.getEmbed(interaction.member, statistic);
        m.reply({ content: text.correct, embeds: [embed] });
      } else {
        tries += 1;

        if (tries < count) {
          m.reply(
            text.wrong
              .replace('<lower/higher>', answer < guess ? text.lower : text.higher)
              .replace('<tries>', count - tries),
          );
        } else {
          statistic.currentStreak = 0;
          collector.stop();

          const embed = await statisticEmbed.getEmbed(
            interaction.member,
            statistic,
            statisticEmbedTemplate,
          );
          m.reply({ content: text.lose.replace('<answer>', answer), embeds: [embed] });
        }
      }
    });

    collector.on('end', () => {
      if (tries > 0) {
        statistic.plays += 1;
      }
      fs.writeFileSync('./datas/user_scores.json', JSON.stringify(scores, null, '\t'));
    });
  },
};
