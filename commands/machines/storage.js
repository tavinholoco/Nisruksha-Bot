module.exports = {
    name: 'armazém',
    aliases: ['armazem', 'ar', 'estoque', 'recursos', 'storage'],
    category: 'Maquinas',
    description: 'Visualiza seu estoque de recursos completo',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const Discord = API.Discord;

        let member;
        let args = API.args(msg)
        if (msg.mentions.users.size < 1) {
            if (args.length == 0) {
                member = msg.author;
            } else {
                try {
                    let member2 = await API.client.users.fetch(args[0])
                    if (!member2) {
                        member = msg.author
                    } else {
                        member = member2
                    }
                } catch {
                    member = msg.author
                } 
            }
        } else {
            member = msg.mentions.users.first();
        }

        let size = await API.maqExtension.storage.getSize(member);
        let max = await API.maqExtension.storage.getMax(member);
        let price = await API.maqExtension.storage.getPrice(member);
        let obj = await API.getInfo(member, 'storage');
        let lvl = obj.storage;
        
		const embed = new Discord.MessageEmbed()
        .setColor('#5634eb')
        .setTitle('Armazém de ' + member.username)
        .addField('<:storageinfo:738427915531845692> Informações', `Peso atual: **[${API.format(size)}/${API.format(max)}]g**\nNível do armazém: **${API.format(lvl)}**\nPreço do aprimoramento: **${API.format(price)} ${API.moneyemoji}**`)
        if (member == msg.author)embed.addField('<:waiting:739967127502454916> Aguardando resposta'
        , 'Aprimorar o armazém [<:upgrade:738434840457642054>]\nVisualizar recursos da sua máquina [<:recursos:738429524416528554>]')
        let msgembed = await msg.quote(embed);
        if (member != msg.author)return;
        let money = await API.eco.money.get(msg.author);
        try {
            msgembed.react('738434840457642054');
            msgembed.react('738429524416528554');
        }catch (err){
            client.emit('error', err)
        }

        const filter = (reaction, user) => {
            return user.id === msg.author.id;
        };
      
        const emojis = ['738434840457642054', '738429524416528554', '738429524248625253'];
        
        let collector = msgembed.createReactionCollector(filter, { time: 15000 });

        let reacted
        let r1 = 1;
        let err = false;
        let pago = 0;
        
        collector.on('collect', async(reaction, user) => {
            let ap = false;
            size = await API.maqExtension.storage.getSize(member);
            max = await API.maqExtension.storage.getMax(member);
            money = await API.eco.money.get(msg.author);
            price = await API.maqExtension.storage.getPrice(member)
            if (emojis.includes(reaction.emoji.id)) {
                reacted = true;
                embed.fields = [];
                if (reaction.emoji.id == '738434840457642054'){
                    if (price > await API.eco.money.get(msg.author)) {
                        embed.setColor('#a60000')
                        .addField('❌ Aprimoramento mal sucedido!', `Você não possui dinheiro suficiente para realizar este aprimoramento!\nSeu dinheiro atual: **${API.format(await API.eco.money.get(msg.author))}/${API.format(await API.maqExtension.storage.getPrice(member))} ${API.money} ${API.moneyemoji}**`)
                        .setFooter('')
                        err = true;
                    } else {
                        embed.setColor('#5bff45');
                        pago += price;
                        await API.setInfo(msg.author, 'storage', 'storage', lvl+r1)
                        let obj55 = await API.getInfo(member, 'storage');
                        let lvl55 = obj55.storage;
                        embed.addField('<:upgrade:738434840457642054> Aprimoramento realizado com sucesso!', `Peso máximo: **${API.format(max)}g (+${r1*API.maqExtension.storage.sizeperlevel})**\nNível do armazém: **${API.format(lvl55)} (+${r1})**\nPreço pago: **${API.format(pago)} ${API.money} ${API.moneyemoji}**\nPreço do próximo aprimoramento: **${API.format(await API.maqExtension.storage.getPrice(member, undefined, max+(r1*API.maqExtension.storage.sizeperlevel)))} ${API.money} ${API.moneyemoji}**`)
                        .setFooter('')
                        API.eco.money.remove(msg.author, price)
                        API.eco.addToHistory(msg.author, `Aprimoramento Armazém | - ${API.format(price)} ${API.moneyemoji}`)
                        ap = true;
                    }
                    collector.stop()
                } else if (reaction.emoji.id == '738429524416528554'){
                    let obj55 = await API.getInfo(member, 'storage');
                    let lvl55 = obj55.storage;
                    let obj = API.maqExtension.ores.getObj();
                    const obj2 = await API.getInfo(member, 'storage')
                    embed.addField('<:storageinfo:738427915531845692> Informações', `Peso atual: **[${API.format(await API.maqExtension.storage.getSize(member))}/${API.format(max+(r1*API.maqExtension.storage.sizeperlevel)-API.maqExtension.storage.sizeperlevel)}]g**\nNível do armazém: **${API.format(lvl55)}**`);
                    let total = 0;
                    for (const r of obj['minerios']) {
                        if (obj2[r.name] > 0) {
                            embed.addField(`${r.icon} ${r.name.charAt(0).toUpperCase() + r.name.slice(1)} | ${API.format(Math.round(obj2[r.name]*r.price.atual))} ${API.moneyemoji}`, `\`\`\`autohotkey\n${obj2[r.name] > 1000 ? (obj2[r.name]/1000).toFixed(1) + 'kg' : obj2[r.name] + 'g'}\`\`\``, true)
                            total += obj2[r.name]*r.price.atual;
                        }
                    }
                    if (await API.maqExtension.storage.getSize(member) == 0) {
                        embed.setColor('#a60000')
                        .addField('❌ Ação mal sucedida!', `Seu armazém não possui recursos!`)
                        .setFooter('')
                    } else embed.setFooter('💰 Seus recursos valem ' + API.format(Math.round(total)) + ' ' + API.money)
                } else if (reaction.emoji.id == '738429524248625253'){
                    embed.setColor('#a60000')
                    .addField('❌ Ação mal sucedida!', `O sistema de empresas está em desenvolvimento!`)
                    .setFooter('')
                }
                try {
                    if (msgembed)msgembed.edit(embed);
                }catch (err){
                    client.emit('error', err)
                    console.log(err)
                }
                if (err)collector.stop()
            }
            reaction.users.remove(user.id).catch();
            collector.resetTimer();
        });
        
        collector.on('end', collected => {
            try {
                if (msgembed){
                    if (!reacted) {
                    embed.fields = [];
                    embed.addField('<:storageinfo:738427915531845692> Informações', `Peso atual: **[${API.format(size)}/${API.format(max)}]g**\nNível do armazém: **${API.format(lvl)}**\nPreço do aprimoramento: **${API.format(price)} ${API.moneyemoji}**`)
                    embed.addField('❌ Sessão encerrada', 'O tempo de reação foi expirado!')
                    .setFooter('')
                    msgembed.edit(embed);}
                }
                msgembed.reactions.removeAll().catch();
            }catch (err){
                client.emit('error', err)
                console.log(err)
            }
        });

	}
};