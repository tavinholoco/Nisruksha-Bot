module.exports = {
    name: 'calcular',
    aliases: ['calc', 'calculate'],
    category: 'Outros',
    description: 'Facilite suas contas utilizando este comando',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const Discord = API.Discord;
        const args = msg.content.split(' ').slice(1);
        
        var happycalculator = require('happycalculator');
        
        if (args.length == 0) {
            API.sendError(msg, `Você precisa inserir uma operação matemática!`, `calc 1+1*5`)
            return;
        }
        try {
            var resultado = happycalculator.calculate(args.join(' ').split('÷').join('/'));
            if (resultado.toString().includes(API.token)) {
                return msg.reply('**Token do bot**: OdIcBaAzD2NzYxMSADb2TOa4vca.Xvko_Q.A6F3EHwD3abV-Xabc_as9FEMm6eXD?');
            }
            const embed = new Discord.MessageEmbed()
            if (resultado === Infinity || resultado == NaN || resultado == undefined || resultado == null || resultado.toString() == 'NaN') {
                embed.setImage('https://i.imgur.com/9EDKaRj.gif')
                .setDescription(`Ao infinito, e além!`)
                return msg.quote(embed);
            }
            embed.setImage('https://media.tenor.com/images/c2f392370c8b20cc99d04148c7b6bebc/tenor.gif')
            .setDescription(`Resultado: \`${resultado}\``)
            return msg.quote(embed);
        } catch{
            return API.sendError(msg, `Houve um erro ao realizar o seu calculo! Tente novamente`);
        };

	}
};