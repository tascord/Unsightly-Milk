// FileSystem Stuff
const fs = require('fs');

// Console Styling
const chalk = require('chalk');

// Storing Games
if(!fs.existsSync('./games.json')) fs.writeFileSync('./games.json', '[]');
var games = JSON.parse(fs.readFileSync('./games.json'));

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
            for(var i = 0; i < games.length; i++) if(games[i].code === req.query.code) return res.render(page('/games/' + games[i].game), {code: games[i].code});
            res.render(pageNon());
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

            for(var i = 0; i < games.length; i++) {
                if(games[i].code === code) {
                    
                    for(var j = 0; j < games[i].players.length; j++) {
                        if(games[i].players[j].name.toLowerCase() == name) return res.redirect('/?error=A Player Already Has That Name!')
                    }
                    
                    var uuid = "";
                    var uuidExists = true;
                    while(uuidExists) {

                        uuid = randString(10);
                        var count = 0;

                        for(var j = 0; j < games[i].players.length; j++) {
                            if(games[i].players[j].id === uuid) {count++}
                        }

                        if(count == 0) uuidExists = false;
                    }

                    games[i].players.push({name: name, id: uuid, score: 0, streak: 0, topAnswer: ""});

                    update();

                    return res.redirect('play?code=' + games[i].code + '&uuid=' + uuid);
                }
            }
        
            res.redirect('/?error=That Room Dosen\'t Exist!');

        break;

        case "/create":

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

// Update The Games.JSON File
function update()    { fs.writeFileSync('./games.json', JSON.stringify(games, null, 4)); }

function randString(length, charSet) {
    
    var result = '';
    if(!charSet) var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = charSet.length;
    
    for ( var i = 0; i < length; i++ ) {
       result += charSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 