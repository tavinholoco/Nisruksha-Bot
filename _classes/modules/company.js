
const API = require("../api.js");

const stars = {};
{
    stars.add = async function(member, company_id, options) {
        
        let owner = await get.ownerById(company_id)
        let memberobj = await API.getInfo(member, 'players')
        let company = await get.companyById(company_id)
        
        let obj = (memberobj.companyact != null ? memberobj.companyact : {
            score: 0,
            last: Date.now(),
            rend: 0
        })
        
        if (options.score) {

            options.score = parseFloat(options.score).toFixed(2)
            
            API.setCompanieInfo(owner, company_id, 'score', parseFloat(company.score) + parseFloat(options.score))
            obj.score = (parseFloat(obj.score) + parseFloat(options.score)).toFixed(2)
            obj.score = parseFloat(obj.score).toFixed(2)
            
        }
        
        
        if (options.rend) {
            obj.rend = parseInt(obj.rend) + Math.round(parseInt(options.rend))
        }
        
        obj.last = Date.now()
        
        obj.score = parseFloat(obj.score).toFixed(2)
        obj.rend = Math.round(parseInt(obj.rend))
        
        API.setInfo(member, 'players', 'companyact', obj)
    }

    stars.gen = function() {
        let x1 = API.random(0, 3)
        let x2 = API.random(2, 6)

        let y = parseFloat('0.' + x1 + '' + x2)
        return y.toFixed(2)
    }

}

const check = {};
{
check.hasCompany = async function(member){


    let cont = false;
    try {
        let res = await API.db.pool.query(`SELECT * FROM companies;`);
        for (const r of res.rows) {

            
            if (r.user_id == member.id) {

                if (r.type != 0) {

                    cont = true;
                    break;

                }

            }
        }
    }catch (err) { 
        client.emit('error', err)
        throw err 
    }

    return cont
    //return obj.type != 0;
}

check.isWorker = async function(member) {
    const obj = await API.getInfo(member, 'players') 
    return obj.company != null;
}

check.hasVacancies = async function(company_id) {
    let result = true;

    try {
        const owner = await API.company.get.ownerById(company_id)
        const res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1 AND user_id=$2;`, [company_id, owner.id]);
        if (res.rows[0].workers != null && res.rows[0].workers != undefined && res.rows[0].workers.length >= (await API.company.get.maxWorkers(company_id))) result = false;
        if (res.rows[0].openvacancie == false) result = false;

    }catch (err){
        client.emit('error', err)
        throw err
    }

    return result
}
}

const get = {};
{
get.maxWorkers = async function(company_id) {
    let result = 3;

    try {
        let res = await API.company.get.companyById(company_id)
        result = res.funcmax

    }catch (err){
        API.client.emit('error', err)
        throw err
    }

    return result
}

get.companyById = async function(company_id) {
    let res
    try {
        
        const owner = await API.company.get.ownerById(company_id)

        res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1 AND user_id=$2;`, [company_id, owner.id]);

        res = res.rows[0];

    }catch (err){
        client.emit('error', err)
        throw err
    }

    if (res == undefined) return null

    return res;
}

get.ownerById = async function(company_id) {
    let res
    try {
        
        res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1;`, [company_id]);

        res = res.rows[0];

    }catch (err){
        client.emit('error', err)
        throw err
    }

    if (res == undefined) return null

    let result = await API.client.users.fetch(res.user_id, {cache: false})

    return result;
}

get.idByOwner = async function(owner) {
    let res
    try {

        res = await API.db.pool.query(`SELECT * FROM companies WHERE user_id=$1;`, [owner.id]);

        res = res.rows[0];

    }catch (err){
        client.emit('error', err)
        throw err
    }

    if (res == undefined) return null

    let result = res.company_id

    return result;
}

get.company = async function(owner) {
    let res
    try {

        res = await API.db.pool.query(`SELECT * FROM companies WHERE user_id=$1;`, [owner.id]);

        res = res.rows[0];

    }catch (err){
        API.client.emit('error', err)
        throw err
    }

    return res
}
}

const jobs = { 
    itens: {},
    maxitens: 30,
    explore: {
        mobs: {
            obj: {}
        },
        equips: {
            obj: {}
        },
    },
    fish: {
        update: 8,
        rods: {
            obj: {}
        },
        list: {
            obj: {}
        }
    },
    agriculture: {
        update: 15
    }
};

// Itens e exploração
{

    jobs.giveItem = async function(msg, dp) {

        let descartados = []
        let colocados = []

        for (const y of dp) {
            if (!y.size) y.size = 1
            y.sz = y.size
        }

        const utilsobj = await API.getInfo(msg.author, 'players_utils')

        let backpackid = utilsobj.backpack;
        let backpack = API.shopExtension.getProduct(backpackid);

        const maxitens = backpack.customitem.itensmax
        const maxtypes = backpack.customitem.typesmax

        
        for (const y of dp) {
            
            let arrayitens = await API.company.jobs.itens.get(msg.author, true, true)
            let curinfo = await API.getInfo(msg.author, 'storage')
            let rsize = curinfo[y.name.replace(/"/g, "")];
            let csize = await API.getInfo(msg.author, 'storage')
            csize2 = csize[y.name.replace(/"/g, '')]
            let s = parseInt(csize2) + parseInt(y.sz)

            if (s >= maxitens) {
                if (s == maxitens) {
                    s -= (s-maxitens)
                } else {
                    if (y.sz - (s-maxitens) <= 0) {
                        s = 0
                    } else {

                        y.sz -= (s-maxitens);
                        y.size -= (s-maxitens);
                        s -= (s-maxitens)
                    }
                }
            }

            if ((arrayitens >= maxtypes && rsize == 0 || csize2 >= maxitens && rsize == 0 || s > maxitens && rsize ==  0) || s == 0) {
                
                descartados.push(y)
                
            } else {
                
                colocados.push(y)
                await API.setInfo(msg.author, 'storage', y.name, s)
                
            }
        }

        for (const y of dp) {
            y.size = y.sz
        }

        return { descartados, colocados }

    }

    jobs.explore.mobs.get = function() {
        if (Object.keys(jobs.explore.mobs.obj).length == 0) jobs.explore.mobs.load();
        return jobs.explore.mobs.obj;
    }

    jobs.explore.mobs.load = function() {

        const { readFileSync } = require('fs')
        const path = './_json/companies/exploration/mobs.json'
        try {
        if (path) {
            const jsonString = readFileSync(path, 'utf8')
            const customer = JSON.parse(jsonString);
            jobs.explore.mobs.obj = customer;
            if (API.debug) console.log(`Mob list loaded`)
        } else {
            console.log('File path is missing from shopExtension!')
            jobs.explore.mobs.obj = '`Error on load mob list`';
        }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
            jobs.explore.mobs.obj = '`Error on load mob list`';
            client.emit('error', err)
        }
    
    }

    jobs.explore.searchMob = function(level) {

        let mobs = jobs.explore.mobs.get();

        let filteredmobs = mobs.filter((mob) => level+1 >= mob.level)

        if (filteredmobs.length == 0) {

            filteredmobs = mobs.slice((level-5 < 0 ? 0 : level-5), level+1)

            if (filteredmobs.length == 0) {

                API.company.jobs.explore.mobs.obj = []

                mobs = jobs.explore.mobs.get();

                filteredmobs = mobs.filter((mob) => level+1 >= mob.level)

                if (filteredmobs.length == 0) {

                    API.client.emit('error', 'Search mob fail: filteredmobs length == 0\nLevel: ' + level)
                    console.log('error', 'Search mob fail: filteredmobs length == 0\nLevel: ' + level)
                    return undefined

                }

            }
		}

        filteredmobs.sort(function(a, b){
            return b.level - a.level;
        });

        filteredmobs = filteredmobs.slice(0, 6)

        
        var generateProportion = function() {
            var max = 100,
              segmentMax = 60,
              tempResults = [],
              remaining = max,
              segments = filteredmobs.length,
              finalResults = [];
              
              //create a series of random numbers and push them into an array
             for (var i = 1; i <= segments; i++) {
                 var r = Math.random() * segmentMax;
              if (i === segments) {
                  // the final segment is just what's left after the other randoms are added up
                  r = remaining;
              }
              tempResults.push(r);
              // subtract them from the total
              remaining -= r;
              // no segment can be larger than what's remaining
              segmentMax = remaining;
            }
            
            //randomly shuffle the array into a new array
            while (tempResults.length > 0) {
                var index = Math.floor(Math.random() * tempResults.length);
                finalResults = finalResults.concat(tempResults.splice(index, 1));
            }
            return finalResults;
        }
        
        //let resultmob = filteredmobs[API.random(0, tonum)]

        var proportion = generateProportion();
        proportion.sort(function(a, b){
            return b - a;
        });
        let tonum = 0;
        let totalchance = 0;
        for (const r of filteredmobs) {
            r.chance = Math.round(proportion[tonum])
            totalchance += Math.round(proportion[tonum]);
            tonum++;
        }

        if (totalchance < 100) {
            filteredmobs[0].chance += 100-totalchance
        }
        
        filteredmobs.sort(function(a, b){
            return a.chance - b.chance;
        });

        //if (API.debug)console.log(filteredmobs)

        let resultmob
        let cr = API.random(0, 100)
        let acc = 0;
        for (const r of filteredmobs) {
            acc += r.chance;
            if (cr < acc) {
                resultmob = r;
                break;
            }
        }

        /*if (resultmob == null || resultmob == undefined) {
            resultmob = await jobs.explore.searchMob(member);
        }*/
        
        resultmob.csta = resultmob.sta
        if (API.random(0, 50) < 25)resultmob.level += API.random(0, 3)
        else if (resultmob.level > 10) resultmob.level -= API.random(0, 3)
        if (API.debug)console.log(resultmob)
        return resultmob;

    }

    jobs.explore.equips.get = function(level, qnt) {
        if (Object.keys(jobs.explore.equips.obj).length == 0) jobs.explore.equips.load();

        let equipobj = jobs.explore.equips.obj;
        
        let num = 0;
        let filteredequips = [];
        for (const r of equipobj) {
              
            
            if (level+1 >= r.level) {
                filteredequips.push(r);
            }

            num++;
        }

        if (filteredequips.length == 0) return undefined;

        filteredequips.sort(function(a, b){
            return b.level - a.level;
        });

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
          
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
          
              // Pick a remaining element...
              randomIndex = Math.floor(Math.random() * currentIndex);
              currentIndex -= 1;
          
              // And swap it with the current element.
              temporaryValue = array[currentIndex];
              array[currentIndex] = array[randomIndex];
              array[randomIndex] = temporaryValue;
            }
          
            return array;
        }

        filteredequips = filteredequips.slice(0, qnt*2);

        shuffle(filteredequips)

        filteredequips = filteredequips.slice(0, qnt)

        if (API.debug)console.log(`${filteredequips.map(e => e.name).join(', ')}`.yellow)
        for (const r of filteredequips) {

            if(!r.dmg) r.dmg = r.level+1*((120-(r.chance*1.13))*0.75/2)
            let x = r.dmg;
            r.dmg = Math.round(x);

        }

        filteredequips.sort(function(a, b){
            return b.dmg - a.dmg;
        });


        return filteredequips;

    }

    jobs.explore.equips.load = function() {
        const { readFileSync } = require('fs')
        const path = './_json/companies/exploration/equip.json'
        try {
        if (path) {
            const jsonString = readFileSync(path, 'utf8')
            const customer = JSON.parse(jsonString);
            jobs.explore.equips.obj = customer;
            if (API.debug) console.log(`Equip list loaded`.yellow)
        } else {
            console.log('File path is missing from shopExtension!')
            jobs.explore.equips.obj = '`Error on load equip list`';
        }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
            jobs.explore.equips.obj = '`Error on load equip list`';
            client.emit('error', err)
        }
    }

    jobs.itens.get = async function(member, filtered, length) {
        let obj = API.maqExtension.ores.getObj();
        let obj2 = obj
        let res;
        await API.setPlayer(member, 'storage')
        const text =  `SELECT * FROM storage WHERE user_id = $1;`,
        values = [member.id]
        try {
            let res2 = await API.db.pool.query(text, values);
            res = res2.rows[0]
        } catch (err) {
            console.log(err.stack)
            client.emit('error', err)
        }
        
        let arrayitens = []
        for (const rddd of obj2.drops) {
            let t1 = rddd
            let rsize = res[t1.name.replace(/"/g, "")];
            t1.size = rsize
            arrayitens.push(t1);
        }

        if (filtered) arrayitens = arrayitens.filter(x => x.size > 0)
        if (length) return arrayitens.length
        return arrayitens
    }

}

// Agricultura
{
    jobs.agriculture.calculatePlantTime = function(plant) {

        let ms = 0;
        let adubacao = 100;

        let seedPerArea = (Math.round(plant.qnt/plant.area))+2

        ms = (200-adubacao)*seedPerArea*(200000)
        ms += (plant.price*500000)+1

        return Math.round(ms)
    }
}

// Pescaria
{

    jobs.formatStars = function(stars) {
        return '⭐'.repeat(stars)
    }

    jobs.fish.rods.get = function(level) {

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
          
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
          
              // Pick a remaining element...
              randomIndex = Math.floor(Math.random() * currentIndex);
              currentIndex -= 1;
          
              // And swap it with the current element.
              temporaryValue = array[currentIndex];
              array[currentIndex] = array[randomIndex];
              array[randomIndex] = temporaryValue;
            }
          
            return array;
        }

        let filteredequips = jobs.fish.rods.possibilities(level)

        shuffle(filteredequips)

        return filteredequips[0];

    }

    jobs.fish.rods.possibilities = function(level) {
        if (Object.keys(jobs.fish.rods.obj).length == 0) jobs.fish.rods.load();

        let equipobj = jobs.fish.rods.obj;
        
        let num = 0;
        let filteredequips = [];
        for (const r of equipobj) {
              
            
            if (level >= r.level) {
                filteredequips.push(r);
            }

            num++;
        }

        if (filteredequips.length == 0) return undefined;

        filteredequips.sort(function(a, b){
            return b.level - a.level;
        });

        filteredequips = filteredequips.slice(0, 3)

        return filteredequips;

    }

    jobs.fish.rods.load = function() {
        const { readFileSync } = require('fs')
        const path = './_json/companies/fish/rods.json'
        try {
        if (path) {
            const jsonString = readFileSync(path, 'utf8')
            const customer = JSON.parse(jsonString);
            jobs.fish.rods.obj = customer;
            if (API.debug) console.log(`rods list loaded`.yellow)
        } else {
            console.log('File path is missing from shopExtension!')
            jobs.fish.rods.obj = '`Error on load rods list`';
        }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
            jobs.fish.rods.obj = '`Error on load rods list`';
            client.emit('error', err)
        }
    }

    jobs.fish.list.get = function(profundidademin, profundidademax) {
        if (Object.keys(jobs.fish.list.obj).length == 0) jobs.fish.list.load();

        let fishobj = jobs.fish.list.obj;
        
        let num = 0;
        let filteredfish = [];
        for (const r of fishobj) {
              
            
            if (r.profundidade >= profundidademin && r.profundidade <= profundidademax) {
                filteredfish.push(r);
            }

            num++;
        }

        if (filteredfish.length == 0) return undefined;

        filteredfish.sort(function(a, b){
            return b.profundidade - a.profundidade;
        });

        filteredfish = filteredfish.slice(0, 7)

        return filteredfish;

    }

    jobs.fish.list.load = function() {
        const { readFileSync } = require('fs')
        const path = './_json/companies/fish/mobs.json'
        try {
        if (path) {
            const jsonString = readFileSync(path, 'utf8')
            const customer = JSON.parse(jsonString);
            jobs.fish.list.obj = customer;
            if (API.debug) console.log(`fish list loaded`.yellow)
        } else {
            console.log('File path is missing from shopExtension!')
            jobs.fish.list.obj = '`Error on load fish list`';
        }
        } catch (err) {
            console.log('Error parsing JSON string:', err);
            jobs.fish.list.obj = '`Error on load fish list`';
            client.emit('error', err)
        }
    }


}

const company = {
    check,
    get,
    stars,
    jobs,
    e: {
        'agricultura': {tipo: 1, icon: '<:icon1:745663998854430731>'},
        'exploração': {tipo: 2, icon: '<:icon2:745663998938316951>'},
        'tecnologia': {tipo: 3, icon: '<:icon3:745663998871076904>'}, 
        'hackeamento': {tipo: 4, icon: '<:icon4:745663998887854080>'}, 
        'segurança': {tipo: 5, icon: '<:icon5:745663998900568235>'},
        'pescaria': {tipo:6, icon: '<:icon6:830966666082910228>'}
       },
    types: {
        1: 'agricultura',
        2: 'exploração',
        3: 'tecnologia',
        4: 'hackeamento',
        5: 'segurança',
        6: 'pescaria'
    }
};

company.create = async function(member, ob) {
    async function gen() {
        
        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345678901234567890123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        let code = `${makeid(6)}`;
        
        try {
            let res = await API.db.pool.query(`SELECT * FROM companies WHERE company_id=$1;`, [code]);
            const embed = new API.Discord.MessageEmbed();
            if (res.rows[0] == undefined) {
                try {
                    townnum = await API.townExtension.getTownNum(member);
                    townname = await API.townExtension.getTownName(member);
                    embed.setTitle(`Nova empresa!`) 
                    .addField(`Informações da Empresa`, `Fundador: ${member}\nNome: **${ob.name}**\nSetor: **${ob.icon} ${ob.tipo.charAt(0).toUpperCase() + ob.tipo.slice(1)}**\nLocalização: **${townname}**\nCódigo: **${code}**`)
                    embed.setColor('#42f57e')
                    API.client.channels.cache.get('747490313765126336').send(embed);
                    await API.db.pool.query(`DELETE FROM companies WHERE user_id=${member.id};`).catch();
                    await API.setCompanieInfo(member, code, 'company_id', code)
                    await API.setCompanieInfo(member, code, 'type', ob.type)
                    await API.setCompanieInfo(member, code, 'name', ob.name)
                    await API.setCompanieInfo(member, code, 'loc', townnum)

                    return code;
                }catch (err){
                    client.emit('error', err)
                    console.log(err)
                }
            } else {
                try{
                    embed.setDescription(`Failed on generating company ${ob.type}:${ob.name} with code ${code}; Try by ${member}`)
                    embed.setColor('#eb4828')
                    API.client.channels.cache.get('747490313765126336').send(embed);
                }catch (err){
                    client.emit('error', err)
                    console.log(err)
                }
                await gen();
            }
        } catch (err) {
            client.emit('error', err)
            throw err
        }



    }

    return await gen();

}

module.exports = company;