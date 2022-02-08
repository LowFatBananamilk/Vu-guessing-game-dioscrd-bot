const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const scores = require('../datas/scores.json');

const count = 5;
const time = 60000;
const min = 1;
const max = 100;
const statisticsTemplate = { played: 0, currentStreak: 0, maxStreak: 0, distribution: [ 0, 0, 0, 0, 0 ] };

module.exports = {  
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('Number guessing game'),
        
	async execute(interaction) {
		await interaction.reply('Guess a number between 1 and 100!');
        const answer = getRandomInt(min, max);
        console.log(`The answer is ${answer}`);
        let tries = 0;

        if (!scores[interaction.member.id])
            scores[interaction.member.id] = { };
        if (!scores[interaction.member.id][interaction.guildId])
            scores[interaction.member.id][interaction.guildId] = Object.assign({}, statisticsTemplate);

        let statistic = scores[interaction.member.id][interaction.guildId];
        statistic.played += 1;

        const filter = m => m.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({ filter, time });

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            const guess = parseInt(m.content);

            if (isNaN(guess)) {
                m.reply('I failed to read a number out of that. Try again with different message!\nOr send `stop` to stop playing');
            }
            else if (guess === answer) {
                m.reply("Congrat! You've guessed the number right!");

                statistic.currentStreak += 1;
                if (statistic.maxStreak < statistic.currentStreak)
                    statistic.maxStreak = statistic.currentStreak;
                statistic.distribution[tries] += 1;
                collector.stop();
            }
            else {
                tries += 1;
                if (tries < count)
                    m.reply(`Oops! The number is ${answer < guess? 'lower' : 'higher'} than your guess!\nYou have ${count - tries} tries left.`);
                else {
                    m.reply(`Uh oh! You ran out of guess.. 😣\nThe number was ${answer}`);

                    statistic.currentStreak = 0;
                    collector.stop();
                }
            }
        });

        collector.on('end', collected => {
            fs.writeFileSync('datas/scores.json', JSON.stringify(scores, null, "\t"));
        });
	}
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
