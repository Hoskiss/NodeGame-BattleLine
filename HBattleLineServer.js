function HBattleLineServer() {

    var express = require('express'),
        app = express();

    var io = require('socket.io'),
        http = require('http');
        cookie = require("cookie"),
        connect = require("connect");

    var hashes = require('hashes'),
        tses_uuid_map = new hashes.HashTable();
    var UUID = require('node-uuid');

    var Card = require('./Card');
    cc = new Card('abc-dajs-232');

    var GAME_PORT = 8009;

    this.init = function() {
        this.game_start = false;


        this.configureExpress();
        this.configureSocketIO();

        io.sockets.on("connection", this.onSocketConnected);
    };

    this.configureExpress = function() {
        app.configure( function() {
            app.set('port', GAME_PORT);
            app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
            //app.use('/', express.static(__dirname));
            app.use('/', express.static(__dirname + '/public'));
            // app.use('/cocos2d', express.static(__dirname + '/cocos2d') );
            // app.use('/extensions', express.static(__dirname + '/extensions') );
            // app.use('/res', express.static(__dirname + '/res') );
            // app.use('/external', express.static(__dirname + '/external') );
            // app.use('/src', express.static(__dirname + '/src') );
            app.use(express.cookieParser());
            app.use(express.session({ secret: 'mySuperSecret',
                                      key: 'express.sid' }));
            // app.use(express.bodyParser());

            app.get('/', function(req, res){
                res.sendfile('index.html');
                console.log('Sent index.html');
            });
        });
    };

    this.configureSocketIO = function() {
        var server = http.createServer(app);
        io = io.listen( server.listen(app.get('port'), function(){
            console.log('Express/SocketIO server on localhost :' + app.get('port'));
        }));

        io.set('log level', 1);
        io.set('authorization', function (handshakeData, accept) {

            // check if there's a cookie header
            if (handshakeData.headers.cookie) {
                // if there is, parse the cookie
                handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
                // the cookie value should be signed using the secret configured above (see line 17).
                // use the secret to to decrypt the actual session id.
                handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');
                // if the session id matches the original value of the cookie, this means that
                // we failed to decrypt the value, and therefore it is a fake.
                if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
                    // reject the handshake
                    console.log("Same value failed!!");
                    return accept('Cookie is invalid.', false);
                }
            }

            else {
               // if there isn't, turn down the connection with a message
               // and leave the function.
               console.log("No cookie!!");
               return accept('No cookie transmitted.', false);
            }
            // accept the incoming connection
            accept(null, true);
        });
    }

    this.onSocketConnected = function(socket) {
        //transform session id, saved in tses_uuid_map
        var tses_id = socket.handshake.cookie['express.sid'].replace(/[^\w\s]/gi, '_');
        var player_id = "";

        //create client uuid db here
        if (!tses_uuid_map.contains(tses_id)) {
            console.log("!!! New Session Connected!!");
            console.log("--- " + tses_id + " ---");

            player_id = UUID();
            tses_uuid_map.add(tses_id, player_id);

            console.log("Create client uuid db!!");
            console.log(player_id);
        }

        else {
            player_id = tses_uuid_map.get(tses_id).value;
        }

        socket.emit('initial', { player_id: player_id });
    };

}

bb = new HBattleLineServer()
bb.init();


// interval = setInterval(function () {
//     update();
// }, 1000/30);

// function update() {

//     console.log('update called');
//     sockets.sockets.emit('update', "update!");

// };


