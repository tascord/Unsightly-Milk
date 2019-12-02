// FileSystem Stuff
const fs = require('fs');

// Console Styling
const chalk = require('chalk');

// Storing Games
if(!fs.existsSync('./games.json')) fs.writeFileSync('./games.json', '{}');
var games = JSON.parse(fs.readFileSync('./games.json'));

// Start WebServer
const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);
http.listen(8080, () => info("Started Server!"));


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
            res.render(page('host'), {});
        break;

        default:
            // Any Page Not Defined Above (A 404)
            res.render(pageNon());
        break;

    }


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


});

// Handling Form Data
app.post('*', (req, res) => {

    switch(req.path) {

        case "/game":
            res.redirect('/?error=That Room Dosen\'t Exist!');
        break;

    }

});

// Coloured Warnings, Logging And Erroring!
function error(text) { console.log(chalk.red(`\n[-] ${text}\n`))    }
function warn(text)  { console.log(chalk.purple(`\n[~] ${text}\n`)) }
function info(text)  { console.log(chalk.cyan(`\n[+] ${text}\n`))   }

// Update The Games.JSON File
function update()    { fs.writeFileSync('./games.json', JSON.stringify(games, null, 4)); }