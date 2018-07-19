'use strict';

let _ = {};
let getUser = require("./search/getUserName").verifyUser;
const reply = require("./search/_reply");
const Kitsu = require('kitsu');
const kitsuGet = new Kitsu();
const report = require("./report");
const utils = require("./utils");
const getPic = require("./search/getPic");
const kitsu = require('./search/main-kitsu-search');
const characterSearch = require('./search/characterSearch')
const mangaSearch = require('./search/mangaSearch')
const animeSearch = require('./search/animeSearch')

_.inline = (type, msg, bot, userLang) => {
    let startTime = new Date().valueOf()
    let query;
    if (type == "inline") {
        query = msg.query;
        // console.log(msg);
    } else if (type == "inchat") {
        query = msg.text.substr(msg.text.indexOf(' ') + 1);
    }
    if (query == null) {
        let a = bot.answerList(msg.id)
        a.addArticle(
            reply.defaultMessage
        )
        return bot.answerQuery(a);
    }
    let sFor = /^-m ?/.test(query) ? 'manga' : (/^-c ?/.test(query) ? 'character' : 'anime');
    // console.log('query1 ' + query + ' sFor ' + sFor)

    if (query.length >= 2 && sFor != 'anime') {
        query = query.split(/^-m ?|^-c ?/)[1]
            // console.log('query2 ' + query + ' sFor ' + sFor)
    }

    // { id: '90214',
    //   type: 'characters',
    //   links: { self: 'https://kitsu.io/api/edge/characters/90214' },
    //   attributes: 
    //    { createdAt: '2017-01-22T11:58:23.270Z',
    //      updatedAt: '2017-01-22T11:58:23.270Z',
    //      slug: 'natsu-76021bc9-4c4f-45f6-ae1f-7358ef92f6da',
    //      names: [Object],
    //      canonicalName: 'Natsu',
    //      otherNames: [],
    //      name: 'Natsu',
    //      malId: 131496,
    //      description: null,
    //      image: [Object] },
    //   relationships: { primaryMedia: [Object], castings: [Object] } },

    // console.log(searchFor)
    if (type == "inline") {
        if (query.length >= 1) {
            let nextOffset = ((msg.offset != '') ? parseInt(msg.offset) + 10 : 0)
            switch (sFor) {
                case 'manga':
                    // console.log('manga reach switch')
                    if (query.length > 0) {
                        return kitsu.searchManga(query, nextOffset).then(res => {
                            let [results, allofit] = res
                            let Data = results;
                            // console.log(results)
                            dataTo_inline(Data, nextOffset, bot, msg, userLang, startTime, 'manga', allofit.meta.count)

                        }).then(() => {
                            let timeDiff = new Date().valueOf() - startTime;
                            let msgText = `Inline query of ${sFor} took ${timeDiff}ms`;
                            console.log(msgText)
                                // bot.sendMessage(process.env.USERS_CNL, msgText);
                        }).catch(handleError => console.log(`---\nmanga Fetch error: ${handleError}\n---`));
                    }
                    break;
                case 'character':
                    // console.log('character reach switch')
                    if (query.length > 0) {
                        return kitsu.findCharacter(query, nextOffset).then(results => {
                            let Data = results;
                            // console.log(results)
                            dataTo_inline(Data, nextOffset, bot, msg, userLang, startTime, 'character')
                        }).then(() => {
                            let timeDiff = new Date().valueOf() - startTime;
                            let msgText = `Inline query of ${sFor} took ${timeDiff}ms`;
                            console.log(msgText)
                                // bot.sendMessage(process.env.USERS_CNL, msgText);
                        }).catch((handleError, p) => {
                            console.log(`---\ncharacter Fetch error: ${handleError} , ${p}\n---`);
                            console.log(handleError)
                        });
                    }
                    break;
                case 'anime':
                    // console.log('anime reach switch')
                    if (query.length > 0) {
                        let count
                        return kitsu.searchAnime(query, nextOffset).then(res => { //nextOffset
                            let [results, allofit] = res
                            let Data = results;
                            let count = allofit.meta.count
                                // console.log(count)
                            dataTo_inline(Data, nextOffset, bot, msg, userLang, startTime, 'anime', count)
                        }).then(() => {
                            let timeDiff = new Date().valueOf() - startTime;
                            let msgText = `Inline query of ${sFor} took ${timeDiff}ms`;
                            // console.log(msgText)
                            // bot.sendMessage(process.env.USERS_CNL, msgText);
                        }).catch(handleError => console.log(`---\nanime Fetch error: ${handleError}\n---`));
                    }
                    break;
                default:
                    console.log('default reach switch')
                    return null

            }
            // kitsu.get(searchFor, {
            //     filter: {
            //         text: query
            //     }
            // }).then(response => {
            //     //console.log(response)
            //     // let Data = response.data;
            //     // dataTo_inline(Data, offset, bot, msg, userLang, startTime)
            // }).then(() => {
            //     let timeDiff = new Date().valueOf() - startTime;
            //     let msgText = 'Inline query took ' + timeDiff + 'ms';
            //     console.log(msgText)
            //         // bot.sendMessage(process.env.USERS_CNL, msgText);
            // }).catch(handleError => console.log(`---\nFetch error: ${handleError}\n---`));
        } else {
            let a = bot.answerList(msg.id)
            a.addArticle(
                reply.defaultMessage
            )
            return bot.answerQuery(a);
        }
    }
    if (type == "inchat") {
        if (msg.query.length >= 3) {
            dataTo_inchat(Data, bot, msg, userLang)
        } else {}
    }
}

//https://kitsu.io/api/edge/anime/6791
function dataTo_inline(Data, nextOffset, bot, msg, userLang, startTime, sFor, count) {
    //check which search to do, and get correct file
    //import file
    let results = {};
    switch (sFor) {
        case 'manga':
            results = mangaSearch(Data, nextOffset, bot, msg, userLang, count);
            break;
        case 'character':
            results = characterSearch(Data, nextOffset, bot, msg, userLang);
            break;
        case 'anime':
            results = animeSearch(Data, nextOffset, bot, msg, userLang, count);
            // console.log(results.list)
            break;
        default:
            results = null
            console.log('nothing');
            break;
    }
    //make it check pre message to see if same id, if so, add this to that message
    // let timeDiff = new Date().valueOf() - startTime;
    let resultsNumber = JSON.stringify(results.list.length);
    report.user(msg, "search", resultsNumber, startTime)

    if (JSON.stringify(results.list.length) == "0") {
        results = bot.answerList(msg.id, { nextOffset: '', cacheTime: 100, personal: false });
        if (nextOffset == 0) {
            results.addArticle(
                reply.errorMessage
            )
        } else {
            results.addArticle(
                reply.errorMessageNoMore
            )
        }
    }
    // console.log(results)

    bot.answerQuery(results)
        .then(response => {
            return //console.log(`bot answered successfully: ${response}`)
        })
        .catch(err => {
            console.log('Error answering query: ', err);
            let errMsg = "Searcher error: ";
            //might be QUERY_ID_INVALID
            let knownErrors = [
                'Bad Request: QUERY_ID_INVALID',
                ''
            ]
            if (knownErrors.includes(err.description)) {
                errMsg = "Description";
                report.error(errMsg, err.description, false);
            } else {
                report.error(errMsg, JSON.stringify(err));
            }
        })
}

function dataTo_inchat(Data, bot, msg) {

}
// https://kitsu.io/api/edge/anime/11351/relationships/genres
_.getGenres = (id, type) => {
    return kitsuGet.get(`${type}/${id}/genres`)
};

// kitsu.searchManga('Monster Musume', 0).then(results => {
//     console.log(results[0])
// });
// kitsu.listAnime(11467).then(results => {
//     console.log(results)
// });
// kitsu.searchAnime('New Game!', 0).then(results => {
//     console.log(results[0])
// });
// kitsu.findCharacter('armin').then(results => {
//     console.log(results)
// });

_.nextEp = (id, type) => {
    return kitsuGet.get(`${type}/${id}/`)
}
_.description = (id, type, maxChar) => {
    return kitsuGet.get(`${type}/${id}/`)
}


// _.inchat = () => {

// }

module.exports = _;