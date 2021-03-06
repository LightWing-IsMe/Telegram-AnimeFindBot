'use strict';

let _ = {};

const ERR_CHNL_CHAT_ID = process.env.ERR_CHNL_CHAT_ID;
const USERS_CNL = process.env.USERS_CNL;
const FEEDBACK_CHNL = process.env.FEEDBACK_CHNL;

let getUser = require("./getUserName").verifyUser;
let bot = require('../botSetup').bot;
let dataOnUser = require('../botSetup').dataOnUser;

// console.log(mdEscape("name"))//i have no idea why this doesnt work and i dont have time no to figure it out

const ops = {
    parseMode: "Markdown",
    notification: false,
    webPreview: true,
    replyToMessage: false,
    replyMarkup: null
};
// ok: false,
// error_code: 400,
// description: 'Bad Request: QUERY_ID_INVALID' 
// description: 'Bad Request: WEBDOCUMENT_URL_INVALID'
// description: 'Bad Request: RESULT_ID_DUPLICATE'

_.error = (errMsg, error, markdown) => {
    const opsErr = {
        parseMode: (markdown == false) ? "HTML" : "Markdown",
        notification: false,
        webPreview: true,
        replyToMessage: false,
        replyMarkup: null
    };
    bot.sendMessage(ERR_CHNL_CHAT_ID, errMsg + error, opsErr);
};
_.feedback = (msg, feedback) => {
    let userID = msg.from.id;
    let head = `ID: \`${userID}\` - [${mdEscaped(getUser(msg.from, "first&last"))}](tg://user?id=${userID})`;//TODO check that this escaping works
    let msgText = msg.text;
    bot.sendMessage(FEEDBACK_CHNL, `${head}\nHas some ${feedback}:\n${msgText}`, ops);
};
let dataToSend = {};
let rmFrom_dataToSend = [];
const DELAY = 20000;
const TIMEOUT = 30000;

_.user = (msg, didWhat, extraInfo, time) => {
    //get id and add all info of same id together
    let userID = msg.from.id;
    //when getting new info add it to 'data'
    let text = '';
    let lang = '';
    let searchTime;

    // console.log(didWhat)

    switch (didWhat) {
        case "search":
            text = `searched "\`${msg.query}\`" and got: ${extraInfo} results`
            searchTime = new Date().valueOf() - time;
            break;
        case 'genre':
            text = 'Genres took ' + time + 'ms';
            break;
        case 'lang':
            lang = `language code = \`${extraInfo}\``; //dataOnUser[userID]['lang']
            break;
        case 'desc':
            text = 'Description took ' + time + 'ms';
            break;
        case 'next':
            if (extraInfo) {
                text = 'Next Ep Air Date took ' + time + 'ms (with extra lookup)😔';
            } else {
                text = 'Next Ep Air Date took ' + time + 'ms (w/o extra lookup)😁';
            }
            break;
        case 'tgAnimeSearch':
            text = 'Searched for the channel ' + extraInfo;
            break;
        case 'tgAnimeFound':
            text = 'Found the channel ' + extraInfo;
            break;
        default:
            text = extraInfo;
    }

    //prepare data
    if (dataToSend[userID] === undefined) {
        dataToSend[userID] = {};
        dataToSend[userID]['msgBody'] = []
    }
    // console.log(msg)
    let searchNum = (dataToSend[userID]['searchNum'] == null || undefined) ? 0 : dataToSend[userID]['searchNum'];

    dataToSend[userID]['time'] = new Date().valueOf();
    // dataToSend[userID]['action'] = didWhat;
    dataToSend[userID]['status'] = 'unprocessed'; // unprocessed || pending || done
    
    //TODO check that this escaping works
    dataToSend[userID]['msgHead'] = `ID: \`${userID}\` - [${mdEscaped(getUser(msg.from, "first&last"))}](tg://user?id=${userID})` // - [FROM](tg://user?id=${msg.chat.id})`;
    if (didWhat != 'lang') {
        if (dataToSend[userID]['msgBody'] === (undefined || null || [] || '')) { // || ["nothing more"]
            dataToSend[userID]['msgBody'] = [text]
        } else {
            // console.log(dataToSend[userID]['msgBody'])
            dataToSend[userID]['msgBody'].push(text)
        }
    } else {
        dataToSend[userID]['lang'] = lang;
        // dataToSend[userID]['msgBody'].push(""); //"nothing more"
    }
    dataToSend[userID]['src'] = dataOnUser[userID]['src'];
    let biggestSearchTime;

    if (didWhat == 'search') {
        biggestSearchTime = ((dataToSend[userID]['searchTime'] != null || undefined) && (dataToSend[userID]['searchTime'] > searchTime)) ? dataToSend[userID]['searchTime'] : searchTime;
        dataToSend[userID]['searchTime'] = biggestSearchTime;
        // dataToSend[userID]['msgBody'].push(`(longest time: ${biggestSearchTime}ms)`);
        searchNum++;
        dataToSend[userID]['searchNum'] = searchNum;
    }
    setInterval(() => {
        // console.log('interval', dataToSend);
        sendReport(bot);
    }, 10000);
};

function sendReport(bot) {
    // console.log('interval', dataToSend);
    for (let userID in dataToSend) {
        let elapsed_time = new Date().valueOf() - dataToSend[userID]['time'];
        // console.log('elapsed_time', elapsed_time);
        if (elapsed_time > DELAY && dataToSend[userID]['status'] === 'unprocessed') {
            try {
                dataToSend[userID]['status'] = 'pending';
                let searchNum = dataToSend[userID]['searchNum'] > 0 ? `\nnumber of searches: ${dataToSend[userID]['searchNum']}` : '';
                let searchTime = dataToSend[userID]['searchTime'] != null || undefined ? `\n(longest search time: ${dataToSend[userID]['searchTime']}ms)` : '';
                let text = uniqBy(dataToSend[userID]['msgBody'], JSON.stringify).toString().replace(/,/g, '\n');
                let src = `Source: ${dataToSend[userID]['src'].charAt(0).toUpperCase() + dataToSend[userID]['src'].slice(1)}`
                let msgText = `${dataToSend[userID]['msgHead']}\n${dataToSend[userID]['lang']}${searchNum}\n${src}\n${text}${searchTime}`
                bot.sendMessage(USERS_CNL, msgText, ops).then(() => {
                    dataToSend[userID]['status'] = 'done';
                    rmFrom_dataToSend.push(userID);
                });
            } catch (e) {
                console.log('error :(', e)
                _.error('error :( ', e)
            }
        }
        for (let i = rmFrom_dataToSend.length - 1; i >= 0; i--) {
            delete dataToSend[rmFrom_dataToSend[i]];
            rmFrom_dataToSend.splice(i, 1);
        }
    }
};

function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
};

function mdEscaped(text) {
    return text
        .replace(/_(.+?)_/g, `\_$1\_`)
        .replace(/\((.+?)\)/g, `\($1\)`)
        .replace(/\*(.+?)\*/g, `\*$1\*`)
        .replace(/`(.+?)`/g, `\`$1\``)
        .replace(/\[(.+?)\]/g, `\[$1\]`);
};




module.exports = _;