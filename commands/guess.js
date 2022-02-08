const { SlashCommandBuilder } = require('@discordjs/builders');

const count = 5;
const time = 60000;
const min = 1;
const max = 100;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('Number guessing game'),
        
	async execute(interaction) {
		await interaction.reply('Guess a number between 1 and 100!');
        const answer = getRandomInt(min, max);
        let tries = 0;

        const filter = m => m.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({ filter, time });

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            const guess = parseInt(m.content);

            if (guess == NaN) {
                m.reply('I failed to read a number out of that. Try again with different message!\nOr send `stop` to stop playing');
            }
            else if (guess === answer) {
                collector.stop();

                m.channel.send("Congrat! You've guessed the number right!");
            }
            else {
                tries += 1;
                if (tries < count)
                    m.channel.send(`Oops! The number is ${answer < guess? 'lower' : 'higher'} than your guess!\nYou have ${count - tries} tries left.`);
                else {
                    collector.stop();
    
                    m.channel.send(`Uh oh! You ran out of guess.. 😣\nThe number was ${answer}`);
                }
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
	}
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
