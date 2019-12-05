// FileSystem Stuff
const fs = require('fs');

// Console Styling
const chalk = require('chalk');

// Start WebServer
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
http.listen(8080, () => info("Started Server!"));

// Getting Information From Forms
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Handling Games
const gameManager = require('./gameManager.js')(fs, io);

// Handling Web Requests
app.get('*', (req, res) => {

    // Handle Public Files (Css, Images, What-have-you)
    if(req.path.indexOf('/p/') == 0) {
        
        var requestedMedia = media(req.path.slice(3));
        
        if(requestedMedia === false) {
            // File Dosen't Exist
            res.send('Sorry, that file dosent\'t exist!');
            return;
        }

        else {
            // File Does Exist
            res.sendFile(requestedMedia);
            return;
        } 
        
    }

    // Handle WebPages
    switch (req.path) {

        case "/":
            // Home Page
            res.render(page('index'), {error: req.query.error ? req.query.error : ""});
        break;

        case "/host":
            // Hosting A Game Dashboard
            res.render(page('host'), {error: req.query.error ? req.query.error : ""});
        break;

        case "/play":
            // Rendering Games
            if(!req.query.uuid || !req.query.code) return res.redirect('/?error=Please Provide The Correct POST Data!');
            
            var player = getPlayer(req.query.code, req.query.uuid);
            var game = getGame(req.query.code);

            if (game == false) return res.redirect('/?error=That Room Dosen\'t Exist');
            if (player == false) return res.redirect('/?error=That Player Dosen\'t Exist!');

            res.render(page('/games/client'), {style: "main.css", code: game.code, name: player.name, token: req.query.uuid, game: game.game});
        break;

        default:
            // Any Page Not Defined Above (A 404)
            res.render(pageNon());
        break;
    }

});

// Handling Form Data
app.post('*', (req, res) => {

    switch(req.path) {

        case "/join":
            
            var code = req.body.roomCode0 + req.body.roomCode1 + req.body.roomCode2 + req.body.roomCode3 + req.body.roomCode4;
            var name = req.body.playerName.trim();
 
            var game = getGame(code);
            if(game === false) return res.redirect('/?error=That Room Dosen\'t Exist');

            if(getPlayer(code, name) != false) return res.redirect('/?error=A Player Already Has That Name!');
              

            var uuid = "";
            var uuidExists = true;
            while(uuidExists) {

                uuid = randString(15);
                var count = 0;

                if(game.players.length === 0) uuidExists = false;

                for(var j = 0; j < game.players.length; j++) {
                    if(game.players[j].id === uuid) {count++}
                }

                if(count == 0) uuidExists = false;
            }

            createPlayer(game.code, {name: name, id: uuid, score: 0, streak: 0, topAnswer: ""}, function() { res.redirect('play?code=' + game.code + '&uuid=' + uuid); });


        break;

        case "/create":
            
            var newGame = req.body;
            
            var games = getGames();

            var code = "";
            var codeExists = true;
            while(codeExists) {

                code = randString(5, "0123456789");
                var count = 0;

                for(var i = 0; i < games.length; i++) {
                    if(games[i].code === code) {count++}
                }

                if(count == 0) codeExists = false;
            }

            var token = "";
            var tokenExists = true;
            while(tokenExists) {

                token = randString(20);
                var count = 0;

                for(var i = 0; i < games.length; i++) {
                    if(games[i].token === token) {count++}
                }

                if(count == 0) tokenExists = false;
            }

            var questionPacks = [],
                askedQuestions = [],
                roundLength = 20,
                roundCount = 10;

            if(newGame.roundCount) roundCount = newGame.roundCount;
            if(newGame.roundLength) roundLength = newGame.roundLength;
            if(newGame.questionPacks) askedQuestions = newGame.questionPacks.split(',');

            var data = {roundLength: roundLength, roundCount: roundCount, questionPacks: questionPacks, askedQuestions: []};

            createGame({code: code, game: newGame.game.toLowerCase(), gameData: data, players: [], hostHeartbeat: true, hostToken: token});

            res.render(page('/games/server'), {style: "main.css", game: newGame.game, socketGroup: token, code: code});

        break;

        default:
            res.send('{success: false, error: "Invalid Post Location"}');
        break;

    }

});

// Make It Easier To Reference Pages
function page(pageName) {

    var path = __dirname + '/pages/' + pageName + '.ejs';

    if(!fs.existsSync(path)) { 
        
        // File Dosen't Exist

        // Send An Error That The Page Dosen't Exist
        error(`Invalid page provided ('${pageName}')!`);
        return pageNon();
    }

    // It Does!
    else return path;

}

function media(mediaPath) {

    var path = __dirname + '/public/' + mediaPath;

    // Media Dosen't Exist
    if(!fs.existsSync(path)) return false;

    // Media Does!
    else return path;

}

function pageNon() {
    
    var path = __dirname + '/pages/404.ejs';

    if(!fs.existsSync(path)) {
        
        // 404 Page Dosen't Exist!

        fs.writeFileSync(__dirname + '/panic.ejs', 'Error finding 404 page, please get a hold of the owner and let them know about this!');
        
        error('The 404 Page Dosen\'t Exist!');
        
        return __dirname + '/panic.ejs'
    }

    // It Does!
    else return path;
}

// Coloured Warnings, Logging And Erroring!
function error(text) { console.log(chalk.red(`\n[-] ${text}\n`))    }
function warn(text)  { console.log(chalk.purple(`\n[~] ${text}\n`)) }
function info(text)  { console.log(chalk.cyan(`\n[+] ${text}\n`))   }

function randString(length, charSet) {
    
    var result = '';
    if(!charSet) var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = charSet.length;
    
    for ( var i = 0; i < length; i++ ) {
       result += charSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 