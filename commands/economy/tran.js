module.exports = {
    name: 'transferir',
    aliases: ['tn', 'pay'],
    category: 'Economia',
    description: 'Transfere uma quantia de dinheiro para outro jogador',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const args = API.args(msg);

        if (msg.mentions.users.size < 1) {
            API.sendError(msg, `Você precisa mencionar um player para transferência!`, `transferir @membro <quantia | tudo>`)
            return;
        }
        const member = msg.mentions.users.first();
        
        if (member.id == msg.author.id) {
            return API.sendError(msg, 'Você precisa mencionar outra pessoa para transferir', 'transferir @membro <quantia | tudo>')
        }

        if (args.length < 2) {
            API.sendError(msg, `Você precisa especificar uma quantia de dinheiro para transferir!`, `transferir @membro <quantia | tudo>`)
			return;
        }
        const money = await API.eco.bank.get(msg.author)
        let total = 0;
        if (args[1] != 'tudo') {

            if (!API.isInt(API.toNumber(args[1]))) {
                API.sendError(msg, `Você precisa especificar uma quantia de dinheiro (NÚMERO) para transferir!`, `transferir @membro <quantia | tudo>`)
                return;
            }

            if (money < API.toNumber(args[1])) {
                API.sendError(msg, `Você não possui essa quantia de dinheiro __no banco__ para transferir!\nUtilize \`${API.prefix}depositar\` para depositar dinheiro no banco`)
                return;
            }

            if (API.toNumber(args[1]) < 1) {
                API.sendError(msg, `Você não pode transferir essa quantia de dinheiro!`)
                return;
            }
            total = API.toNumber(args[1])
        } else {
            if (money < 1) {
                API.sendError(msg, `Você não possui dinheiro __no banco__ para transferir!`)
                return;
            }
            total = money;
        }

        const Discord = API.Discord;
        const client = API.client;

        const check = await API.playerUtils.cooldown.check(msg.author, "transferir");
        if (check) {

            API.playerUtils.cooldown.message(msg, 'transferir', 'usar outro comando de transferir')

            return;
        }
        

        const check2 = await API.playerUtils.cooldown.check(member, "receivetr");
        if (check2) {

            let cooldown = await API.playerUtils.cooldown.get(member, "receivetr");
            const embed = new Discord.MessageEmbed()
            .setColor('#b8312c')
            .setDescription('❌ Este membro já recebeu uma transferência nas últimas 12 horas!\nAguarde mais `' + API.ms(cooldown) + '` para fazer uma transferência para ele!')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            await msg.quote(embed);
            return;
        }

        let memberobj = await API.getInfo(member, "machines")
        let nivel = memberobj.level
        let mat = Math.round(Math.pow(nivel, 2) * 500);
        
        if (total > mat) {
            API.sendError(msg, `O limite de transferência recebido por ${member} é de ${API.format(mat)} ${API.money} ${API.moneyemoji}!`)
            return;
        }

        API.playerUtils.cooldown.set(msg.author, "transferir", 20);
        
		const embed = new API.Discord.MessageEmbed();
        embed.setColor('#606060');
        embed.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))

        embed.addField('<a:loading:736625632808796250> Aguardando confirmação', `
        Você deseja transferir o valor de **${API.format(total)} ${API.money} ${API.moneyemoji}** para ${member}?`)
        let embedmsg = await msg.quote(embed);
        await embedmsg.react('✅')
        embedmsg.react('❌')

        const emojis = ['✅', '❌']

        const filter = (reaction, user) => {
            return user.id === msg.author.id;
        };
        

        const collector = embedmsg.createReactionCollector(filter, { time: 15000 });
        let reacted = false;
        collector.on('collect', async (reaction, user) => {
            await reaction.users.remove(user.id);
            if (!(emojis.includes(reaction.emoji.name))) return;
            reacted = true;
            collector.stop();
            if (reaction.emoji.name == '❌'){
                embed.fields = [];
                embed.setColor('#a60000');
                embed.addField('❌ Transferência cancelado', `
                Você cancelou a transferência de **${API.format(total)} ${API.money} ${API.moneyemoji}** para ${member}.`)
            } else {
                const money2 = await API.eco.bank.get(msg.author);
                if (money2 < total) {
                    embed.fields = [];
                    embed.setColor('#a60000');
                    embed.addField('❌ Falha na transferência', `Você não possui **${API.format(total)} ${API.money} ${API.moneyemoji}** __no banco__ para transferir!`)
                } else {
                    embed.fields = [];
                    embed.setColor('#5bff45');
                    embed.addField('✅ Sucesso na transferência', `
                    Você transferiu o valor de **${API.format(total)} ${API.money} ${API.moneyemoji}** para ${member} com sucesso!`)
                    API.eco.bank.remove(msg.author, total);
                    API.eco.bank.add(member, total);
                    API.eco.addToHistory(msg.member, `📤 Transferência para ${member} | - ${API.format(total)} ${API.moneyemoji}`)
                    API.eco.addToHistory(member, `📥 Transferência de ${msg.member} | + ${API.format(total)} ${API.moneyemoji}`)
                    let obj = await API.getInfo(msg.author, "players");
                    API.setInfo(msg.author, "players", "tran", obj.tran + 1);
                    if (total > mat/2.5) {
                        API.playerUtils.cooldown.set(member, "receivetr", 43200);
                    }
                }
            }
            API.playerUtils.cooldown.set(msg.author, "transferir", 0);
            embedmsg.edit(embed);
        });
        
        collector.on('end', collected => {
            embedmsg.reactions.removeAll();
            if (reacted) return
            API.playerUtils.cooldown.set(msg.author, "transferir", 0);
            embed.fields = [];
            embed.setColor('#a60000');
            embed.addField('❌ Tempo expirado', `
            Você iria transferir o valor de **${API.format(total)} ${API.money} ${API.moneyemoji}** para ${member}, porém o tempo expirou.`)
            embedmsg.edit(embed);
            return;
        });

	}
};