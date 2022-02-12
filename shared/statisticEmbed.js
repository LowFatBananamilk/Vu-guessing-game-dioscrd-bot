const barSize = 5;

module.exports = {
  getEmbed(guildMember, statistic, embedTemplate) {
    const embed = JSON.parse(JSON.stringify(embedTemplate));

    embed.description = embed.description.replace("<user>", guildMember.displayName ? guildMember.displayName : guildMember.username);
    embed.color = parseInt(embed.color);
    embed.fields[0].value = statistic.plays.toString();
    embed.fields[2].value = `${(statistic.wins / statistic.plays * 100).toFixed(2)}%`;
    embed.fields[3].value = statistic.currentStreak.toString();
    embed.fields[5].value = statistic.maxStreak.toString();
    if (statistic.wins != 0)
      [6, 7, 8, 9, 10].forEach(i => {
        embed.fields[i].value = toBarGraph(statistic.distribution[i - 6], statistic.wins) + ` | ${statistic.distribution[i - 6]}`
      });
    else
      [6, 7, 8, 9, 10].forEach(i => {
        embed.fields.pop();
      });

    return embed;
  }
};

function toBarGraph(value, total) {
  const barNumber = Math.round(value / total * barSize)

  let barGraph = '';
  for (i = 0; i < barNumber; i++)
    barGraph += '🟨';
  for (i = 0; i < barSize - barNumber; i++)
    barGraph += '⬛';

  return barGraph
}