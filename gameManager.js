var games = [];

function getGames() {
    return games;
}

function createGame(game) {
    games.push(game);
}

function removeGame(gameID) {
    for(var i = 0; i < games.length; i++) {
        if(games[i].id == gameID) games = games.slice()
    }
}

(function() {

    var obj = ['g', 'a', 'm', 'i', 'n', 'g'];
    var _obj = [];
    
    console.log(obj);
    
    for(var i = 0; i < obj.length; i++) {
        if(obj[i] == "m") continue;
        _obj.push(obj[i]);
    }

    obj = _obj;

    console.log(obj);

})();