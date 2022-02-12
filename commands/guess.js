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
            const { guess } = require('../translations/en.json');
            text = guess;
        }
        else {
            const { guess } = require(`../translations/${servers[interaction.guildId].language}.json`);
            text = guess;
        }

        interaction.reply(text.instruction);
        const answer = getRandomInt(min, max);
        console.log(`The answer is ${answer}`);
        let tries = 0;

        if (!scores[interaction.member.id])
            scores[interaction.member.id] = {};
        if (!scores[interaction.member.id][interaction.guildId])
            scores[interaction.member.id][interaction.guildId] = JSON.parse(JSON.stringify(statisticsTemplate));

        const statistic = scores[interaction.member.id][interaction.guildId];
        statistic.plays += 1;

        const filter = m => m.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({ filter, time });

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            const guess = parseInt(m.content);

            if (isNaN(guess)) {
                m.reply(text.read_fail);
            }
            else if (guess === answer) {
                statistic.wins += 1;
                statistic.currentStreak += 1;
                if (statistic.maxStreak < statistic.currentStreak)
                    statistic.maxStreak = statistic.currentStreak;
                statistic.distribution[tries] += 1;

                m.reply({ content: text.win, embeds: [statisticEmbed.getEmbed(interaction.member, statistic, text.statisticEmbed)] });

                collector.stop();
            }
            else {
                tries += 1;
                if (tries < count)
                    m.reply(text.wrong.replace('<lower/higher>', answer < guess ? 'lower' : 'higher').replace('<tries>', count - tries));
                else {
                    m.reply({ content: text.lose.replace('<answer>', answer), embeds: [statisticEmbed.getEmbed(interaction.member, statistic, text.statisticEmbed)] });

                    statistic.currentStreak = 0;
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            fs.writeFileSync('./datas/scores.json', JSON.stringify(scores, null, '\t'));
        });
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
