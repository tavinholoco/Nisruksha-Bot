module.exports = {
    name: 'equipar',
    aliases: ['equip'],
    category: 'Maquinas',
    description: 'Equipa alguma placa que está no inventário da sua máquina',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const Discord = API.Discord;

        let pieces = await API.maqExtension.getPieces(msg.author);
        let playerobj = await API.getInfo(msg.author, 'machines');
        let pobj = await API.getInfo(msg.author, 'players');

        var args = API.args(msg);

        if (API.cacheLists.waiting.includes(msg.author, 'mining')) {
            API.sendError(msg, `Você não pode equipar/desequipar chipes enquanto está minerando! [[VER MINERAÇÃO]](${API.cacheLists.waiting.getLink(msg.author, 'mining')})`);
            return;
        }

        if (args.length < 1) {
            API.sendError(msg, `Você precisa escrever um ID de chipe para equipar!\nUtilize \`${API.prefix}maquina\` para visualizar seus chipes`, `equipar <id>`);
            return;
        }
        let contains = false;
        let placa;

        if (pieces.length >= args[0]) {
            placa = pieces[parseInt(args[0])-1]
            contains = true
        }

        if (contains == false) {
            API.sendError(msg, `Você não possui este chipe no inventário da máquina para equipar!\nUtilize \`${API.prefix}maquina\` para visualizar seus chipes`);
            return;
        }

        const mvp = (pobj.mvp == null ? false : true)

        if (playerobj.slots != null && playerobj.slots.length >= API.maqExtension.getSlotMax(playerobj.level, mvp)) {
            API.sendError(msg, `Você não possui slots suficientes na sua máquina para equipar isto!\nUtilize \`${API.prefix}maquina\` para visualizar seus slots`);
            return;
        }
        
		const embed = new Discord.MessageEmbed()
		.addField('<a:loading:736625632808796250> Aguardando confirmação', `
        Você deseja equipar **${placa.icon ? placa.icon+' ':''}${placa.name}** na sua máquina?`)
        const embedmsg = await msg.quote(embed);
        
        await embedmsg.react('✅')
        embedmsg.react('❌')

        const filter = (reaction, user) => {
            return user.id === msg.author.id;
        };
        
        const collector = embedmsg.createReactionCollector(filter, { time: 15000 });
        let reacted = false;
        collector.on('collect', async (reaction, user) => {
            await reaction.users.remove(user.id);
            if (!(['✅', '❌'].includes(reaction.emoji.name))) return;
            reacted = true;
            collector.stop();
            embed.fields = []

            if (reaction.emoji.name == '❌'){
                embed.setColor('#a60000');
                embed.addField('❌ Equipar cancelado', `
                Você cancelou a o equipar de **${placa.icon ? placa.icon+' ':''}${placa.name}**.`)
                embedmsg.edit(embed);
                return;
            }

            let pieces1 = await API.maqExtension.getPieces(msg.author);
            let playerobj1 = await API.getInfo(msg.author, 'machines');

            let contains1 = false;

            if (pieces1.length >= parseInt(args[0])) {
                contains1 = true
            }

            if (!contains1) {
                embed.setColor('#a60000')
                .addField('❌ Falha ao equipar', `Você não possui este chipe no inventário da máquina para equipar!\nUtilize \`${API.prefix}maquina\` para visualizar seus chipes`)
                embedmsg.edit(embed);
                return;
            }

            if (playerobj.slots != null && playerobj1.slots.length >= API.maqExtension.getSlotMax(playerobj1.level, mvp) || API.maqExtension.getSlotMax(playerobj1.level, mvp) == 0) {
                embed.setColor('#a60000')
                .addField('❌ Falha ao equipar', `Você não possui slots suficientes na sua máquina para equipar isto!\nUtilize \`${API.prefix}maquina\` para visualizar seus slots`)
                embedmsg.edit(embed);
                return;
            }

            embed.setColor('#5bff45');
            embed.addField('✅ Sucesso ao equipar', `Você equipou **${placa.icon ? placa.icon+' ':''}${placa.name}** na sua máquina com sucesso!\nUtilize \`${API.prefix}maquina\` para visualizar seus slots e chipes`)
            embedmsg.edit(embed);

            API.maqExtension.givePiece(msg.author, placa.id);
            API.setInfo(msg.author, 'storage', `"piece:${placa.id}"`, placa.size-1)

        });
        
        collector.on('end', async collected => {
            embedmsg.reactions.removeAll();
            if (reacted) return;
            embed.fields = []
            embed.setColor('#a60000')
            .addField('❌ Tempo expirado', `
            Você iria equipar **${placa.icon ? placa.icon+' ':''}${placa.name}**, porém o tempo expirou!`)
            embedmsg.edit(embed);
            return;
        });

	}
};