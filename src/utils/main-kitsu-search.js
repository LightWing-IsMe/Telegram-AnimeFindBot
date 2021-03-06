var request = require("request");

//0.4 => 1.0, thanks to the guy that pointed it out on GitHub

exports.searchAnime = function(query, offset) {
    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/anime?filter[text]=' + query + '&page%5Boffset%5D=' + (offset.toString() ? offset : '0'), //&page%5Blimit%5D=1
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve([results, allofit])
            }
        })
    })
}

exports.listAnime = function(offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/anime?page%5Blimit%5D=10&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.searchManga = function(query, offset) {
    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/manga?filter[text]=' + query + '&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve([results, allofit])
            }
        })
    })
}

exports.listManga = function(offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/manga?page%5Blimit%5D=10&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.searchDrama = function(query, offset) {
    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/drama?filter[text]=' + query + '&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.listDrama = function(offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/drama?page%5Blimit%5D=10&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.listUsers = function(offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/users?page%5Blimit%5D=10&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.getUser = function(username) {
    return new Promise(function(resolve, reject) {
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/users?filter[slug]=' + username,
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.listGenres = function(offset, limit) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        if (limit === null || limit === undefined) {
            limit = 10
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/genres?page%5Blimit%5D=' + (limit.toString() ? limit : '10') + '&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.listRating = function(offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET', // %2C = , // G, PG,R,R18 //manga or anime
            url: 'https://kitsu.io/api/edge/manga?filter%5BageRating%5D=G&page%5Blimit%5D=20&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve(results)
            }
        })
    })
}

exports.findCharacter = function(name, offset) {
    return new Promise(function(resolve, reject) {
        if (offset === null || offset === undefined) {
            offset = 0
        }
        request({
            method: 'GET',
            url: 'https://kitsu.io/api/edge/characters?filter[name]=' + name + '&page%5Blimit%5D=10&page%5Boffset%5D=' + (offset.toString() ? offset : '0'),
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json'
            }
        }, function(error, response, body) {
            if (error) {
                reject(Error(error))
            } else {
                var allofit = JSON.parse(body)
                var results = allofit.data
                resolve([results, allofit])
            }
        })
    })
}