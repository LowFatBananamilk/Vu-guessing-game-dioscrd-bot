const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('Number guessing game'),
        
	async execute(interaction) {
		await interaction.reply('Guess a number between 1 and 100!');
	},
};
