module.exports = {
    name: 'empresaedit',
    aliases: ['empresaedit', 'companyedit', 'companyedit'],
    category: 'Empresas',
    description: 'Personalize sua empresa do comando verempresa',
      async execute(API, msg) {
  
          const boolean = await API.checkAll(msg);
          if (boolean) return;

          const args = API.args(msg)
          const Discord = API.Discord

          const embed = new Discord.MessageEmbed().setColor(`#fc7b03`)
        
          if (!(await API.company.check.hasCompany(msg.author))) {
              API.sendError(msg, `Você deve possuir uma empresa para realizar esta ação!\nPara criar sua própria empresa utilize \`${API.prefix}abrirempresa <setor> <nome>\``)
              return;
          }
        
          const companyid = await API.company.get.idByOwner(msg.author)
          const company = await API.company.get.company(msg.author)

          const pricenome = 35

          if (args.length == 0) {
              embed.setDescription(`🐻 Olá, sou o Teddy e estou aqui para te auxiliar.\nVeja alguns comandos possíveis relacionados a empresaedit:\n \n\`${API.prefix}empresaedit background\` - Envie uma imagem junto do comando e seta o background da empresa no \`${API.prefix}veremp\`\n\`${API.prefix}empresaedit logo\` - Envie uma imagem junto do comando e seta a logo da empresa\n\`${API.prefix}empresaedit desc <texto>\` - Seta a descrição da sua empresa.\n\`${API.prefix}empresaedit vagas <on|off>\` - Seta a disponibilidade de vagas.\n\`${API.prefix}empresaedit taxa <1-50%>\` - Seta a taxa da empresa.\n\`${API.prefix}empresaedit nome <novonome>\` - Modifica o nome da sua empresa. ${pricenome} ⭐`)
              await msg.quote(embed);
              return;
            }
            
            let ch = args[0].toLowerCase();
            
          if (['background', 'bg', 'logo', 'desc', 'description', 'descrição', 'setarvaga', 'vaga', 'vagas', 'setvaga', 'taxa', 'nome', 'name'].includes(ch) == false) {
            embed.setDescription(`🐻 Olá, sou o Teddy e estou aqui para te auxiliar.\nVeja alguns comandos possíveis relacionados a empresaedit:\n \n\`${API.prefix}empresaedit background\` - Envie uma imagem junto do comando e seta o background da empresa no \`${API.prefix}veremp\`\n\`${API.prefix}empresaedit logo\` - Envie uma imagem junto do comando e seta a logo da empresa\n\`${API.prefix}empresaedit desc <texto>\` - Seta a descrição da sua empresa.\n\`${API.prefix}empresaedit vagas <on|off>\` - Seta a disponibilidade de vagas.\n\`${API.prefix}empresaedit taxa <1-50%>\` - Seta a taxa da empresa.\n\`${API.prefix}empresaedit nome <novonome>\` - Modifica o nome da sua empresa. ${pricenome} ⭐`)
            await msg.quote(embed);
            return;
          }

          if (ch == 'background' || ch == 'bg') {

            const attachment = msg.attachments.array()
              if (attachment.length < 1) {
              API.sendError(msg, 'Você não enviou uma imagem junto do comando!\nRecomendado imagens 700x450')
              return;
            }
    
            let url = attachment[0].url;
    
            if (!attachment[0].name.match(/.(jpg|jpeg|png|gif)$/i)){
              API.sendError(msg, `O arquivo que você enviou não é uma imagem!\nFormatos disponíveis: jpg, jpeg, png. (Seu arquivo: ${attachment[0].name.split('.')[attachment[0].name.split('.').length-1]})`)
              return;
            }
    
            if(attachment[0].size > 1050000) {
              API.sendError(msg, `A imagem que você enviou é muito pesada! Por favor envie uma imagem mais leve.\nTamanho do arquivo: **${(attachment[0].size/1000000).toFixed(1)}/1 MB**`)
              return;
            }
    
            API.setCompanieInfo(msg.author, companyid, 'bglink', url)
  
            embed
              .setColor('#8adb5e')
              .setDescription(`O background da sua empresa foi definido para:`)
              .setFooter(`Você pode visualizar as mudanças usando ${API.prefix}veremp`)
              .setImage(url);
              await msg.quote(embed);
            const embed2 = new Discord.MessageEmbed()
              .setColor('#8adb5e')
              .setDescription(`Background da **EMPRESA** de \`${msg.author.tag} | ${msg.author.id}\``)
              .setImage(url);
              try{
                API.client.guilds.cache.get('693150851396796446').channels.cache.get('736383144499871765').send(embed2);
              }catch (err){
                client.emit('error', err)
              }

          } else if (ch == 'logo') {

              const attachment = msg.attachments.array()
              if (attachment.length < 1) {
                API.sendError(msg, 'Você não enviou uma imagem junto do comando!\nRecomendado imagens 150x150')
                return;

              }
      
              let url = attachment[0].url;
      
              if (!attachment[0].name.match(/.(jpg|jpeg|png|gif)$/i)){
                API.sendError(msg, `O arquivo que você enviou não é uma imagem!\nFormatos disponíveis: jpg, jpeg, png. (Seu arquivo: ${attachment[0].name.split('.')[attachment[0].name.split('.').length-1]})`)
                return;
              }
              
              if(attachment[0].size > 1050000) {
                API.sendError(msg, `A imagem que você enviou é muito pesada! Por favor envie uma imagem mais leve.\nTamanho do arquivo: **${(attachment[0].size/1000000).toFixed(1)}/1 MB**`)
                return;
              }
              
              API.setCompanieInfo(msg.author, companyid, 'logo', url)
    
              embed
                .setColor('#8adb5e')
                .setDescription(`A logo da sua empresa foi definida para:`)
                .setFooter(`Você pode visualizar as mudanças usando ${API.prefix}veremp`)
                .setImage(url);
                await msg.quote(embed);
                const embed2 = new Discord.MessageEmbed()
                .setColor('#8adb5e')
                .setDescription(`Logo da **EMPRESA** de \`${msg.author.tag} | ${msg.author.id}\``)
                .setImage(url);
              try{
                API.client.guilds.cache.get('693150851396796446').channels.cache.get('736383144499871765').send(embed2);
              }catch (err){
                client.emit('error', err)
              }

        } else if (ch.startsWith('desc')) {

            if (args.length == 1) {
              API.sendError(msg, 'Você precisa definir um texto para setar como descrição', 'empresaedit desc <texto>')
              return;
            }
            
            if (API.getMultipleArgs(msg, 2).length > 50) {
              API.sendError(msg, 'Você não pode colocar uma descrição com mais de 50 caracteres\nQuantia de caracteres da descrição: ' + API.getMultipleArgs(msg, 1).length + '/50', 'empresaedit desc <texto>')
                return;
              }
            API.setCompanieInfo(msg.member, companyid, "descr", API.getMultipleArgs(msg, 2))

            embed
            .setColor('#8adb5e')
            .setFooter(`Você pode visualizar as mudanças usando ${API.prefix}veremp`)
            .setDescription(`A descrição da sua empresa foi definida para:
            \`\`\`${API.getMultipleArgs(msg, 2)}\`\`\``)
            .setFooter('Quantia de caracteres da descrição: ' + API.getMultipleArgs(msg, 2).length + '/50')
            await msg.quote(embed);

        } else if (ch.startsWith('vaga')) {
          if (args.length == 1) {
            API.sendError(msg, `Você deve indicar se deseja liberar as vagas da empresa ou não **[on/off]**`, `empresaedit vagas off`)
            return;
          }

          let boo = false;

          if (args[1] != 'on' && args[1] != 'off') {
              API.sendError(msg, `Você deve indicar se deseja liberar as vagas da empresa ou não **[on/off]**`, `empresaedit vagas off`)
              return;
          }

          boo = (args[1] == 'on' ? boo = true : boo = false)

          const embed = new Discord.MessageEmbed()
          .setColor((boo ? '#5bff45':'#a60000'))
          .setDescription('Você setou as vagas da sua empresa para ' +  (boo ? '🟢':'🔴')  + ' **' + args[1] + '**')
          await msg.quote(embed)
          const companyid = await API.company.get.idByOwner(msg.author)
          API.setCompanieInfo(msg.author, companyid, 'openvacancie', boo)

        } else if (ch.startsWith('taxa')) {

          if (args.length == 1) {
            API.sendError(msg, `Você deve digitar o valor da taxa para funcionários! **[1%-50%]**\nA taxa padrão é de **25%**`, `empresaedit taxa 25%`)
            return;
          }

          let taxa = args[1].replace(/%/g, '')

          if (!API.isInt(taxa)) {
              API.sendError(msg, `Você deve digitar o valor da taxa __EM NÚMERO__ para funcionários! **[1%-50%]**\nA taxa padrão é de **25%**`, `empresaedit taxa 25%`)
              return;
          }
          taxa = parseInt(taxa)
          if (taxa < 1 || taxa > 50) {
              API.sendError(msg, `Você deve digitar o valor da taxa entre 1% e 50%! **[1%-50%]**\nA taxa padrão é de **25%**`, `empresaedit taxa 25%`)
              return;
          }


          const embed = new Discord.MessageEmbed()
          .setColor('RANDOM')
          .setDescription('Você setou a taxa da sua empresa para __' + taxa + '%__')
          await msg.quote(embed)
          const companyid = await API.company.get.idByOwner(msg.author)
          API.setCompanieInfo(msg.author, companyid, 'taxa', taxa)

          API.playerUtils.cooldown.set(msg.author, "settaxa", 86400);

        } else if (ch.startsWith('name') || ch.startsWith('nome')) {

          const company = await API.company.get.company(msg.author)

          if (args.length == 1) {
            API.sendError(msg, `Você deve digitar o novo nome para a sua empresa`, `empresaedit nome <nome>`)
            return;
          }

          let novonome = args[1]

          const embed = new API.Discord.MessageEmbed();
          embed.setColor('#606060');
          embed.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
          
          embed.addField('<a:loading:736625632808796250> Aguardando confirmação', `
          Você deseja gastar ${pricenome} ⭐ e trocar o nome da sua empresa para **${novonome}**?`)
          
          let embedmsg = await msg.quote(embed);

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
              embed.fields = [];

              if (reaction.emoji.name == '❌'){
                embed.setColor('#a60000');
                embed.addField('❌ Alteração cancelada', `
                Você cancelou a troca de nome da sua empresa para **${novonome}**.`)
                embedmsg.edit(embed);
                return;
            }

              if ((company.score < pricenome)) {
                  embed.setColor('#a60000');
                  embed.addField('❌ Falha na alteração', `A sua empresa não possui score o suficiente para realizar a troca de nome!\nScore: **${API.format(company.score.toFixed(2))}/${API.format(pricenome)} ⭐**`)
                  embedmsg.edit(embed);
                  return;
              }

              API.setCompanieInfo(msg.author, company.company_id, 'score', parseFloat(company.score) - pricenome)

              embed.setColor('#5bff45')
              .setTitle('')
              embed.addField('✅ Nome modificado', `
              Você gastou ${pricenome} ⭐ da empresa para modificar o nome da sua empresa para **${novonome}**.`)
              embed.setFooter('')
              embedmsg.edit(embed);

              API.setCompanieInfo(msg.author, company.company_id, 'name', novonome)
              API.playerUtils.cooldown.set(msg.author, "setname", 86400*2);

          });
          
          collector.on('end', async collected => {
              embedmsg.reactions.removeAll();
              if (reacted) return;

              embed.fields = [];

              embed.setColor('#a60000')
              .addField('❌ Tempo expirado', `Você iria gastar ${pricenome} ⭐ para alterar o nome da sua empresa para **${novonome}**, porém o tempo expirou!`)
              embedmsg.edit(embed);

          });

        }

        API.playerUtils.cooldown.set(msg.author, "seecompany", 0);
  
      }
  };