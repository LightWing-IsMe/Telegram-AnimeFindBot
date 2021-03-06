'use strict';

let getPic = require('../utils/getPic')
let lang = require('../langFiles/LANG');
const animeSearch = require('./animeSearch')

let bot = require('../botSetup').bot;
let dataOnUser = require('../botSetup').dataOnUser;
let utils = require("../utils/utils");

let _ = {}

_ = (Data, nextOffset, msg, count) => {

    let userID = msg.from.id;
    let userLang = dataOnUser[userID]['lang'];
    let originalQuery = msg.query;

    let results = bot.answerList(msg.id, { nextOffset: nextOffset, cacheTime: 300, personal: true, pmText: lang[userLang].found + ' ' + count + ' ' + lang[userLang].results, pmParameter: 'setting' });
    // results.addArticle(
    //     reply.loadedMore
    // )
    for (let i = 0, len = Data.length; i < len; i++) {
        let data = Data[i].attributes;
        data = JSON.parse(utils.md2tgmd(JSON.stringify(data)))

        //console.log(originalQuery)

        if (!data.canonicalTitle.includes('delete')) { // && data.ageRatingGuide != "Mild Nudity"
            // console.log(data.id)
            let dateToMilisec = (data.nextRelease != null) ? new Date(data.nextRelease.replace(' ', 'T').replace(' ', '')).valueOf() : "";
            let replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton(lang[userLang].description, { callback: Data[i].id + (Data[i].type == 'manga' ? '-m' : '-a') + '-d' }), 
                bot.inlineButton(lang[userLang].genres, { callback: Data[i].id + (Data[i].type == 'anime' ? '-a' : '-m') + '-g' })],
                (data.nextRelease != null) ? [bot.inlineButton(lang[userLang].nextRelease, { callback: (Data[i].id + (Data[i].type == 'anime' ? '-a' : '-m') + '-nxt-' + dateToMilisec) })] : [],
                (dataOnUser[userID]['tachi'] == 1 
                ? [bot.inlineButton(lang[userLang].searchAgain, { inlineCurrent: originalQuery.toString() }),
                bot.inlineButton(lang[userLang].tachiLink, { url: `${utils.tachiyomiLink}${data.canonicalTitle}` }) ]
                : [bot.inlineButton(lang[userLang].searchAgain, { inlineCurrent: originalQuery.toString() })])
            ]);
            let thumb = getPic(data, 'thumb');
            let desc = data.synopsis != (null && undefined) ? data.synopsis : lang[userLang].desc_not_available; //.replace(/<(?:.|\n)*?>/gm, '');
            if (desc == (null || undefined || '')) {
                desc = lang[userLang].desc_not_available;
            } else if (desc.length >= 100) {
                desc = desc.substring(0, 100);
                let last = desc.lastIndexOf(" ");
                desc = desc.substring(0, last);
                desc = desc + "...";
            }
            var searchResault = {
                id: Data[i].id,
                title: `[${lang[userLang].kitsuStuff[data.subtype]}] ${data.canonicalTitle}`,
                description: desc,
                url: Data[i].links.self.replace("api/edge/", ""),
                hide_url: true,
                thumb_url: thumb,
                input_message_content: {
                    message_text: animeSearch.messageSent(data, userLang, Data[i].type, Data[i].id),
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                },
                reply_markup: replyMarkup
            }
            results.addArticle(searchResault);
        }
    }
    return results;
};

module.exports = _;