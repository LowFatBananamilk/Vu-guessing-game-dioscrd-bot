const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const statisticEmbed = require('../shared/statisticEmbed');

const servers = require('../datas/server_settings.json');
const scores = require('../datas/user_scores.json');
let text;

const count = 5;
const time = 60000;
const min = 1;
const max = 100;
const statisticsTemplate = { plays: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0] };

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

    const answer = Math.floor(Math.random() * (max - min + 1)) + min;
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

    let reply;
    const filter = (m) => m.author.id === interaction.member.id;
    const collector = interaction.channel.createMessageCollector({ filter, time });

    collector.on('collect', async (m) => {
      if (process.env.environment === 'dev') {
        console.log(`Collected ${m.content}`);
      }

      if (m.content === 'stop') {
        collector.stop();
      }

      const guess = parseInt(m.content, 10);
      if (Number.isNaN(guess)) {
        m.reply(text.read_fail);
      } else if (guess === answer) {
        reply = m.reply(text.correct);

        statistic.wins += 1;
        statistic.currentStreak += 1;
        if (statistic.maxStreak < statistic.currentStreak) {
          statistic.maxStreak = statistic.currentStreak;
        }
        statistic.distribution[tries] += 1;
        collector.stop();
      } else {
        tries += 1;

        if (tries < count) {
          m.reply(
            text.wrong
              .replace('<lower/higher>', answer < guess ? text.lower : text.higher)
              .replace('<tries>', count - tries),
          );
        } else {
          reply = m.reply(text.lose.replace('<answer>', answer));

          statistic.currentStreak = 0;
          collector.stop();
        }
      }
    });

    collector.on('end', async () => {
      if (tries > 0) {
        statistic.plays += 1;
        const embed = await statisticEmbed.getEmbed(
          interaction.member,
          statistic,
          statisticEmbedTemplate,
        );
        if (reply) {
          reply.edit({ content: reply.content, embeds: [embed] });
        }
      } else {
        interaction.followUp(text.time_out);
      }
      fs.writeFileSync('./datas/user_scores.json', JSON.stringify(scores, null, '\t'));
    });
  },
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
