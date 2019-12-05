var games = [];

var setGames = false;

var intervals = [];

module.exports = (fs, io) => {

    getGames = function() {
        return games;
    }

    createGame = function(game, callback) {
        games.push(game);
             
        createSocketServer(game);

        updateGames();

        if(callback) callback();
    }

    getGame = function(gameID) {
        
        for(var i = 0; i < games.length; i++) {
            if(games[i].code == gameID) return games[i];
        }

        return false;
    }

    updateGame = function(gameID, gameData, callback) {
        
        var _games = [];

        for(var i = 0; i < games.length; i++) {
            if(games[i].code === gameID) _games.push(gameData);
            else _games.push(games[i]);
        }

        games = _games;
                
        updateGames();
        
        if(callback) callback();

    }

    removeGame = function(gameID) {

        var _games = [];

        for(var i = 0; i < games.length; i++) {
            if(games[i].id === gameID) continue; 
            _games.push(games[i]);
        }

        games = _games;
                
        updateGames();

        if(callback) callback();
    }

    createPlayer = function(gameID, player, callback) {
        
        var game = getGame(gameID);
        game.players.push(player);

        if(game === false) return false;

        updateGame(gameID, game);
        updateGames();

        if(callback) callback();
       
    }

    getPlayer = function(gameID, playerID) {

        var game = getGame(gameID);

        if(game == false) return false;

        if(game.players.length === 0) return false;

        for(var i = 0; i < game.players.length; i++) {

            if(game.players[i].name === playerID) return game.players[i];
            if(game.players[i].id === playerID) return game.players[i];
        }

        return false;

    }

    createSocketServer = async function(game) {

        var serverAddress = "/" + game.token;
        var clientAddress = "/" + game.code;

        io.of(clientAddress).on('join', () => {
            io.of(serverAddress).emit('member', getGame(game.name).players.length);
        });

    }

    updateGames = function() {
        fs.writeFileSync('./games.json', JSON.stringify(games, null, 4));
    }

    loadGames = function() {
        
        if(setGames == true) return;
        setGames = true;

        if(!fs.existsSync('./games.json')) fs.writeFileSync('./games.json', '[]');
        games = JSON.parse(fs.readFileSync('./games.json'));
    }

    if(setGames == false) loadGames();

}