const fs = require('fs');
const { DiscordClient } = require('../discordClient');

const translationFiles = fs.readdirSync('./translations').filter((file) => file.endsWith('.json'));
const barSize = 5;

function toBarGraph(value, total) {
  const barNumber = Math.round((value / total) * barSize);

  let barGraph = '';
  for (let i = barNumber; i > 0; i -= 1) barGraph += '🟨';
  for (let i = barSize - barNumber; i > 0; i -= 1) barGraph += '⬛';

  return barGraph;
}

module.exports = {
  async getEmbed(guildMember, statistic, embedTemplate) {
    const embed = JSON.parse(JSON.stringify(embedTemplate));

    embed.description = embed.description.replace('<user>', guildMember.displayName ? guildMember.displayName : guildMember.username);
    embed.color = 0xfdcc58;
    embed.fields[0].value = statistic.plays.toString();
    embed.fields[2].value = `${((statistic.wins / statistic.plays) * 100).toFixed(2)}%`;
    embed.fields[3].value = statistic.currentStreak.toString();
    embed.fields[5].value = statistic.maxStreak.toString();
    if (statistic.wins !== 0) {
      [6, 7, 8, 9, 10].forEach((i) => {
        embed.fields[i].value = `${toBarGraph(statistic.distribution[i - 6], statistic.wins)} | ${statistic.distribution[i - 6]}`;
      });
    } else {
      [6, 7, 8, 9, 10].forEach(() => {
        embed.fields.pop();
      });
    }

    switch (Math.floor(Math.random() * 2)) {
      case 0:
        break;
      case 1:
        // eslint-disable-next-line no-case-declarations
        const rnd = Math.floor(Math.random() * translationFiles.length);
        if (translationFiles[rnd] === 'language_file_template.json') {
          // eslint-disable-next-line global-require, import/extensions
          const { credit, yourDiscordID } = require('../translations/en');
          const bananamilk = await DiscordClient.users.fetch(yourDiscordID);

          embed.footer.text = credit.replace('<bananamilk>', bananamilk.tag);
          embed.footer.icon_url = bananamilk.displayAvatarURL({ dynamic: true });
        } else {
          // eslint-disable-next-line global-require, import/no-dynamic-require
          const { translationCredit, yourDiscordID } = require(`../translations/${translationFiles[rnd]}`);
          const translator = await DiscordClient.users.fetch(yourDiscordID);

          embed.footer.text = translationCredit.replace('<you>', translator.tag);
          embed.footer.icon_url = translator.displayAvatarURL({ dynamic: true });
        }
        break;
      default:
    }

    return embed;
  },
};
