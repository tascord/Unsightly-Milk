var games = [];
var setGames = false;

module.exports = (fs) => {

    getGames = function() {
        return games;
    }

    createGame = function(game) {
        games.push(game);
                
        updateGames();
    }

    getGame = function(gameID) {
        
        for(var i = 0; i < games.length; i++) {
            if(games[i].code === gameID) return games[i];
        }

        return false;
    }

    updateGame = function(gameID, gameData) {
        
        var _games = [];

        for(var i = 0; i < games.length; i++) {
            if(games[i].code === gameID) _games.push(gameData);
            else _games.push(games[i]);
        }

        games = _games;
                
        updateGames();

    }

    removeGame = function(gameID) {

        var _games = [];

        for(var i = 0; i < games.length; i++) {
            if(games[i].id === gameID) continue; 
            _games.push(games[i]);
        }

        games = _games;
                
        updateGames();
    }

    createPlayer = function(gameID, player) {
        
        var game = getGame(gameID);
        game.players.push(player);

        if(game === false) return false;

        updateGame(gameID, game);
        
        updateGames();
       
    }

    getPlayer = function(gameID, playerID) {

        var game = getGame(gameID);
        if(!game) return false;

        if(game.players.length === 0) return false;

        for(var i = 0; i < game.players.length; i++) {
            if(game.player[i].uuid === playerID) return player[i];
            if(game.player[i].uuid === playerID) return player[i];
        }

    }

    updateGames = function() {
        fs.writeFileSync('./games.json', JSON.stringify(games));
    }

    loadGames = function() {
        
        if(setGames == true) return;
        setGames = true;

        if(!fs.existsSync('./games.json')) fs.writeFileSync('./games.json', '[]');
        games = JSON.parse(fs.readFileSync('./games.json'));
    }

    if(setGames == false) loadGames();

}