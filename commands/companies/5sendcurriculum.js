module.exports = {
    name: 'enviarcurriculo',
    aliases: ['enviarcurrículo', 'enviarc'],
    category: 'Empresas',
    description: 'Envia um currículo de trabalho para alguma empresa',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        const Discord = API.Discord;
        const client = API.client;
        const args = API.args(msg)

        if (await API.company.check.hasCompany(msg.author)) {
            API.sendError(msg, `Você não pode enviar currículo para alguma empresa pois você já possui uma`)
            return;
        }

        if (await API.company.check.isWorker(msg.author)) {
            API.sendError(msg, `Você não pode enviar currículo para outra empresa pois você já trabalha em uma`)
            return;
        }

        if (args.length == 0) {
            API.sendError(msg, `Você precisa digitar um código de empresa para enviar um currículo!\nPesquise empresas utilizando \`${API.prefix}empresas\``, 'enviarc 000Z10')
            return;
        }

        
        let company

        try{
            const owner = await API.company.get.ownerById(args[0])
			
			if (owner == null) {
				API.sendError(msg, `O id de empresa ${args[0]} é inexistente!\nPesquise empresas utilizando \`${API.prefix}empresas\``)
                return;
			}
			
            const res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1 AND user_id=$2`, [args[0], owner.id]);

            if (res.rows[0] == undefined || res.rows[0] == null) {
                API.sendError(msg, `O id de empresa ${args[0]} é inexistente!\nPesquise empresas utilizando \`${API.prefix}empresas\``)
                return;
            } else {
                company = res.rows[0]
            }

        }catch (err){ 
            client.emit('error', err)
            throw err 
        }

        let locname = API.townExtension.getTownNameByNum(company.loc)
        let townname = await API.townExtension.getTownName(msg.author);
        
        if (locname != townname) {
            API.sendError(msg, `Você precisa estar na mesma vila da empresa para enviar o currículo!\nSua vila atual: **${townname}**\nVila da empresa: **${locname}**\nPara visualizar o mapa ou se mover, utilize, respectivamente, \`${API.prefix}mapa\` e \`${API.prefix}mover\``, `mover ${locname}`)
            return;
        }

        const pobjmaq = await API.getInfo(msg.author, 'machines')

        if (pobjmaq.level < 3) {
            API.sendError(msg, `Você não possui nível o suficiente para enviar currículo!\nSeu nível atual: **${pobjmaq.level}/3**\nVeja seu progresso atual utilizando \`${API.prefix}perfil\``)
            return;
        }

        if (!(await API.company.check.hasVacancies(args[0]))) {
            API.sendError(msg, `Esta empresa não possui vagas ou estão fechadas, tente novamente quando houver vagas!`)
            return;
        }


        if (company.curriculum != null && company.curriculum.length >= 10) {
            API.sendError(msg, `Esta empresa já possui o máximo de currículos pendentes **10/10**.`)
            return;
        }
        let clist0 = []
        if (company.curriculum != null) {
            clist0 = company.curriculum
        }
        let currincl = false
        for (const r of clist0) {
            if (r.includes(msg.author.id)) {currincl = true;break}
        }

        if (currincl == true) {
            API.sendError(msg, `Você já enviou um currículo para esta empresa! Aguarde uma resposta.\nOBS: Para receber uma resposta você deve manter sua DM liberada.`)
            return;
        }
        
		const embed = new Discord.MessageEmbed()
		embed.addField('<a:loading:736625632808796250> Aguardando confirmação', `
        Você deseja enviar seu currículo para a empresa **${API.company.e[API.company.types[company.type]].icon} ${company.name}**?`)
        .setFooter('Ao enviar o currículo você está em consentimento em receber DM\'S do bot de quando você for aceito ou negado na empresa!')
        let embedmsg = await msg.quote(embed);
        
        await embedmsg.react('✅')
        embedmsg.react('❌')

        const filter = (reaction, user) => {
            return user.id === msg.author.id;
        };
        
        const collector = embedmsg.createReactionCollector(filter, { time: 30000 });
        let reacted = false;
        collector.on('collect', async (reaction, user) => {
            await reaction.users.remove(user.id);
            if (!(['✅', '❌'].includes(reaction.emoji.name))) return;
            reacted = true;
            collector.stop();
            embed.fields = [];

            if (reaction.emoji.name == '❌'){
                embed.setColor('#a60000');
                embed.addField('❌ Currículo cancelado', `
                Você cancelou o envio de currículo para a empresa **${API.company.e[API.company.types[company.type]].icon} ${company.name}**.`)
                embedmsg.edit(embed);
                return;
            } else {
                
                
                let companyobj
                try{
                    const owner = await API.company.get.ownerById(args[0])
                    const res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1 AND user_id=$2`, [args[0], owner.id]);
                    
                    if (res.rows[0] == undefined || res.rows[0] == null) {
                        API.sendError(msg, `O id de empresa ${args[0]} é inexistente!\nPesquise empresas utilizando \`${API.prefix}empresas\``)
                        return;
                    } else {
                        companyobj = res.rows[0]
                    }
                    
                }catch (err){ 
                    client.emit('error', err)
                    throw err 
                }
                if (companyobj.curriculum != null && companyobj.curriculum.includes(msg.author.id)) {
                    embed.setColor('#a60000');
                    embed.addField('❌ Falha no currículo', `
                    Você já enviou um currículo para esta empresa! Aguarde uma resposta..`)
                    embedmsg.edit(embed);
                    return;
                }
                if (await API.company.check.hasCompany(msg.author)) {
                    embed.setColor('#a60000');
                    embed.addField('❌ Falha no currículo', `
                    Você não pode enviar currículo para alguma empresa pois você já possui uma`)
                    embedmsg.edit(embed);
                    return;
                }
        
                if (await API.company.check.isWorker(msg.author)) {
                    embed.setColor('#a60000');
                    embed.addField('❌ Falha no currículo', `
                    Você não pode enviar currículo para outra empresa pois você já trabalha em uma`)
                    embedmsg.edit(embed);
                    return;
                }
                if (!(await API.company.check.hasVacancies(args[0]))) {
                    embed.setColor('#a60000');
                    embed.addField('❌ Falha no currículo', `
                    Esta empresa não possui vagas ou estão fechadas, tente novamente quando houver vagas!`)
                    embedmsg.edit(embed);
                    return;
                }
                let clist = []
                if (companyobj.curriculum != null) {
                    clist = companyobj.curriculum
                }
                clist.push(`${msg.author.id};${Date.now()}`)
                embed.setColor('#5bff45')
                let botowner = await API.client.users.fetch(API.owner[0])
                try {
                    let companyowner = await API.client.users.fetch(companyobj.user_id)
                    API.setCompanieInfo(companyowner, companyobj.company_id, "curriculum", clist)
                    const embed2 = new Discord.MessageEmbed()
                    embed2.setColor('#5bff45')
                    embed2.setDescription(`O membro ${msg.author} enviou um currículo para a sua empresa!\nUtilize \`${API.prefix}curriculos\` em algum servidor do bot para visualizar os currículos pendentes.`)
                    .setFooter(`Você está em consentimento em receber DM\'S do bot para ações de funcionários na sua empresa!\nCaso esta mensagem foi um engano, contate o criador do bot (${botowner.tag})`)
                    await companyowner.send(embed2).catch()
                } catch { 
                }
                
                embed.setColor('#5bff45');
                embed.addField('✅ Currículo enviado', `
                Você enviou o currículo para a empresa **${API.company.e[API.company.types[company.type]].icon} ${company.name}**!\nAguarde uma resposta da empresa.\nOBS: Para receber uma resposta você deve manter sua DM liberada.`)
                .setFooter('Ao enviar o currículo você está em consentimento em receber DM\'S do bot de quando você for aceito ou negado na empresa!')
                embedmsg.edit(embed);

                return;
            }

        });
        
        collector.on('end', async collected => {
            embedmsg.reactions.removeAll();
            if (reacted) return;
            const embed = new API.Discord.MessageEmbed();
            embed.setColor('#a60000');
            embed.addField('❌ Tempo expirado', `Você iria enviar o currículo para a empresa **${API.company.e[API.company.types[company.type]].icon} ${company.name}**, porém o tempo expirou.`)
            embedmsg.edit(embed);
            return;
        });

	}
};