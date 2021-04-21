
const API = require("../../_classes/api");

let bg

loadbg()

async function loadbg() {
    bg = await API.img.loadImage(`resources/backgrounds/maq/maqbackground.png`)
}

module.exports = {
    name: 'máquina',
    aliases: ['maquina', 'maq', 'machine'],
    category: 'Maquinas',
    description: 'Visualiza as informações da sua máquina',
	async execute(API, msg) {

		const boolean = await API.checkAll(msg);
        if (boolean) return;

        let member;
        let args = API.args(msg)
        try {
            if (msg.mentions.users.size < 1) {
                if (args.length == 0) {
                    member = msg.author;
                } else {
                    let member2 = await API.client.users.fetch(args[0])
                    if (!member2) {
                        member = msg.author
                    } else {
                        member = member2
                    }
                }
            } else {
                member = msg.mentions.users.first();
            }
        } catch {
            member = msg.author
        } 

        const check = await API.checkCooldown(msg.author, "profile");
        if (check) {

            let cooldown = await API.getCooldown(msg.author, "profile");
            const embed = new API.Discord.MessageEmbed()
            .setColor('#b8312c')
            .setDescription('🕑 Aguarde mais `' + API.ms(cooldown) + '` para visualizar um perfil!')
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            msg.quote(embed);
            return;
        }

        API.setCooldown(msg.author, "profile", 10);

        let todel = await msg.quote(`<a:loading:736625632808796250> Carregando informações da máquina`)

        let background = bg

        const Discord = API.Discord;
        
		const embed = new Discord.MessageEmbed()

        const playerobj = await API.getInfo(member, 'machines')
        let energia = await API.maqExtension.getEnergy(member);
        let energymax = await API.maqExtension.getEnergyMax(member);

        let maqid = playerobj.machine;
        let maq = API.shopExtension.getProduct(maqid);

        let profundidade = await API.maqExtension.getDepth(member)

        const ep = await API.maqExtension.getEquipedPieces(member);

        background = await API.img.drawText(background, maq.name, 24, './resources/fonts/Uni Sans.ttf', '#ffffff', 250, 38, 4)

        background = await API.img.drawText(background, Math.round(energia/energymax)*100 + '%', 20, './resources/fonts/Uni-Sans-Light.ttf', '#ffffff', 380, 104, 3)
        
        background = await API.img.drawText(background, Math.round(playerobj.durability/maq.durability)*100 + '%', 20, './resources/fonts/Uni-Sans-Light.ttf', '#ffffff', 380, 135, 3)

        background = await API.img.drawText(background, profundidade + 'm', 20, './resources/fonts/Uni-Sans-Light.ttf', '#ffffff', 380, 167, 3)

        let maqimg = await API.img.loadImage(maq.img)
        maqimg = await API.img.resize(maqimg, 100, 100);

        background = await API.img.drawImage(background, maqimg, 200, 80)

        const locked = await API.img.loadImage(`resources/backgrounds/maq/locked.png`)

        const maxslots = API.maqExtension.getSlotMax(playerobj.level)

        if (maxslots < 5) {
            background = await API.img.drawImage(background, locked, 398, 220)
        }
        if (maxslots < 4) {
            background = await API.img.drawImage(background, locked, 312, 252)
        }
        if (maxslots < 3) {
            background = await API.img.drawImage(background, locked, 220, 242)
        }
        if (maxslots < 2) {
            background = await API.img.drawImage(background, locked, 117, 255)
        }
        if (maxslots < 1) {
            background = await API.img.drawImage(background, locked, 19, 219)
        }

        if (ep.length !== 0) {
            if (ep[0]) {
                let chip = API.shopExtension.getProduct(ep[0]);
                let chipimg = await API.img.loadImage(chip.img)
                chipimg = await API.img.resize(chipimg, 60, 60);
                background = await API.img.drawImage(background, chipimg, 19, 219)
            }
            if (ep[1]) {
                let chip = API.shopExtension.getProduct(ep[1]);
                let chipimg = await API.img.loadImage(chip.img)
                chipimg = await API.img.resize(chipimg, 60, 60);
                background = await API.img.drawImage(background, chipimg, 117, 255)
            }
            if (ep[2]) {
                let chip = API.shopExtension.getProduct(ep[2]);
                let chipimg = await API.img.loadImage(chip.img)
                chipimg = await API.img.resize(chipimg, 60, 60);
                background = await API.img.drawImage(background, chipimg, 220, 242)
            }
            if (ep[3]) {
                let chip = API.shopExtension.getProduct(ep[3]);
                let chipimg = await API.img.loadImage(chip.img)
                chipimg = await API.img.resize(chipimg, 60, 60);
                background = await API.img.drawImage(background, chipimg, 312, 252)
            }
            if (ep[4]) {
                let chip = API.shopExtension.getProduct(ep[4]);
                let chipimg = await API.img.loadImage(chip.img)
                chipimg = await API.img.resize(chipimg, 60, 60);
                background = await API.img.drawImage(background, chipimg, 398, 220)
            }
        }
        
        embed.setDescription(`A cada 6 níveis você adquire +1 slot para equipar chipes!\nPara manusear chipes use \`${API.prefix}equipar\` e \`${API.prefix}desequipar\``)
        embed.setAuthor(member.tag, member.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        embed.setColor('#7e6eb5')
        const attachment = await API.img.getAttachment(background, 'maq.png')
        embed.attachFiles([attachment])
        embed.setImage('attachment://maq.png')

        msg.quote(embed);

        try {
            todel.delete().catch();
        }catch{}

	}
};