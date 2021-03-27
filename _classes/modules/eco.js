const API = require("../api.js");

const bank = {};

bank.get = async function (member) {
    let { bank } = await API.getInfo(member, "players");
    return bank;
}

bank.add = async function (member, money) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "bank", Math.round(parseInt(obj["bank"]) + parseInt(money)));
}

bank.remove = async function (member, money) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "bank", Math.round(parseInt(obj["bank"]) - parseInt(money)));
}

bank.set = async function (member, money) {
    API.setInfo(member, "players", "bank", parseInt(money));
}

const points = {};

points.get = async function (member) {
    let result
    let obj = await API.getInfo(member, "players");
    result = obj["points"];
    return result;
}

points.add = async function (member, points) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "points", obj["points"] + points);
}

points.remove = async function (member, points) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "points", obj["points"] - points);
}

points.set = async function (member, points) {
    API.setInfo(member, "players", "points", points);
}

const money = {};

money.get = async function (member) {
    let { money } = await API.getInfo(member, "players");
    return parseInt(money);
}

money.add = async function (member, money) {
    let obj = await API.getInfo(member, "players");
    await API.setInfo(member, "players", "money", Math.round(parseInt(obj["money"]) + parseInt(money)));
}

money.remove = async function (member, money) {
    let obj = await API.getInfo(member, "players");
    await API.setInfo(member, "players", "money", Math.round(parseInt(obj["money"]) - parseInt(money)));
}

money.set = async function (member, money) {
    await API.setInfo(member, "players", "money", parseInt(Math.round(money)));
}

money.set = async function (member, points) {
    API.setInfo(member, "players", "points", points);
}

const token = {};

token.get = async function (member) {
    //let result
    let { token } = await API.getInfo(member, "players");
    //result = obj["money"];
    return token;
}

token.add = async function (member, token) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "token", obj["token"] + token);
}

token.remove = async function (member, token) {
    let obj = await API.getInfo(member, "players");
    API.setInfo(member, "players", "token", obj["token"] - token);
}

token.set = async function (member, token) {
    API.setInfo(member, "players", "token", token);
}

const eco = {
    money: money,
    points: points,
    token: token,
    bank: bank
};

eco.getHistory = function (member, n) {

    const fs = require('fs')

    const { readFileSync } = require('fs')
    let fpath = `./_localdata/profiles/${member.id}/history.yml`;
    eco.createHistoryDir(member);

    if (n) {
        return readFileSync(fpath, 'utf8').split('\n')[n];
    } else {
        let str = readFileSync(fpath, 'utf8').split('\n').slice(0, 5).join("\n");
        return str.replace(/<nl>/g , "\n");
    }
}

eco.createHistoryDir = function(member) {

    const fs = require('fs')
    let dir0 = `./_localdata/`;
    let dir = `./_localdata/profiles/`;
    let dir2 = `./_localdata/profiles/${member.id}/`;
    let fpath = `./_localdata/profiles/${member.id}/history.yml`;
    let strin = `\`${API.getFormatedDate()}\` Conta criada`
    if (!fs.existsSync(dir0)) { fs.mkdirSync(dir0);} 
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir);} 
    if (!fs.existsSync(dir2)) { fs.mkdirSync(dir2);} 
    if (!fs.existsSync(fpath)) {
        fs.writeFileSync(fpath, strin, (err) => {
            if (err) {
                client.emit('error', err)
                return console.log(`creating: [${err}]`)
            }
        })
        
    }
}

eco.addToHistory = async function (member, arg) {
    const insertLine = require('insert-line');

    eco.createHistoryDir(member);

    let fpath = `./_localdata/profiles/${member.id}/history.yml`;
    let content = `\`${API.getFormatedDate()}\` ${arg}`

    insertLine(fpath).content(content).at(1).then((err) => {
        if (err) {
            client.emit('error', err)
            return console.log(`inserting: [${err}]`)
        }
      })


}

module.exports = eco;