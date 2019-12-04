// FileSystem Stuff
const fs = require('fs');

// Console Styling
const chalk = require('chalk');

// Game Handler
const gameManager = require('./gameManager.js')(fs);

// Start WebServer
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
http.listen(8080, () => info("Started Server!"));

// Getting Information From Forms
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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
            var game = getGames(req.query)

            if(game === false) return res.render(pageNon());
            res.render(page('/games/' + game.game), {code: game.code});
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

                uuid = randString(10);
                var count = 0;

                if(game.players.length === 0) uuidExists = false;

                for(var j = 0; j < game.players.length; j++) {
                    if(game.players[j].id === uuid) {count++}
                }

                if(count == 0) uuidExists = false;
            }

            createPlayer(game.code, {name: name, id: uuid, score: 0, streak: 0, topAnswer: ""});

            return res.redirect('play?code=' + game.code + '&uuid=' + uuid);

        break;

        case "/create":
            
            var neweGame = req.body;
            
            var code = "";
            var codeExists = true;

            var games = getGames();

            while(codeExists) {

                code = randString(5, "0123456789");
                var count = 0;

                for(var j = 0; j < games.length; j++) {
                    if(games[j].code === code) {count++}
                }

                if(count == 0) uuidExists = false;
            }            

            neweGame.code = code;
            createGame(game);

            res.send(getGames());
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
        console.log(`[-] Error: Invalid page provided ('${pageName}')!`);
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
 