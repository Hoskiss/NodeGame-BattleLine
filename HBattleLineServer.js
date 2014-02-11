// reference: https://github.com/leeroybrun/socketio-express-sessions

function HBattleLineServer() {

    var io = require('socket.io');
    var http = require('http');
    var express = require('express'),
        app = express();

    // We define the key of the cookie containing the Express SID
    var EXPRESS_SID_KEY = 'express.sid';
    // We define a secret string used to crypt the cookies sent by Express
    var COOKIE_SECRET = 'my battleline secret';
    var cookieParser = express.cookieParser(COOKIE_SECRET);
    // Create a new store in memory for the Express sessions
    var sessionStore = new express.session.MemoryStore();

    var hashes = require('hashes'),
        tses_uuid_map = new hashes.HashTable();
    var UUID = require('node-uuid');

    var GAME_PORT = process.env.PORT || 8009,
        GAME_HOST = process.env.HOST || 'localhost';

    // var c_m = require('./HCardsManager');
    // c1 = new c_m.CardCategory([["aa", 1], ["aa", 2], ["aa", 90] ]);
    // c2 = new c_m.CardCategory([["bb", 10], ["bb", 20], ["bb", 90] ]);
    // console.log(c1.lessThan(c2));

    // c1 = new c_m.Card("dsa-fas-4232");
    // c2 = new c_m.Card("dsa-fas-5631");

    this.init = function() {
        this.game_start = false;

        this.configureExpress();
        this.configureSocketIO();

        io.sockets.on("connection", this.onSocketConnected);
    };

    this.configureExpress = function() {
        app.configure( function() {
            app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
            app.use(cookieParser);
            app.use(express.session({
                store: sessionStore,
                cookie: {httpOnly: true},
                key: EXPRESS_SID_KEY
            }));

            //app.use('/', express.static(__dirname));
            app.use('/', express.static(__dirname + '/public'));
            // app.use('/cocos2d', express.static(__dirname + '/cocos2d') );
            // app.use('/extensions', express.static(__dirname + '/extensions') );
            // app.use('/res', express.static(__dirname + '/res') );
            // app.use('/external', express.static(__dirname + '/external') );
            // app.use('/src', express.static(__dirname + '/src') );

            app.get('/', function(req, res){
                res.sendfile('index.html');
                console.log('Sent index.html');
            });

        });
    };

    this.configureSocketIO = function() {
        this.server = http.createServer(app);
        io = io.listen(this.server);

        io.set('log level', 1);
        // We configure the socket.io authorization handler (handshake)
        io.set('authorization', function (handshake_data, callback) {
            if(!handshake_data.headers.cookie) {
                console.log("No cookie!!");
                return callback('No cookie transmitted.', false);
            }

            // We use the Express cookieParser created before to parse the cookie
            // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
            // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
            cookieParser(handshake_data, {}, function(parseErr) {
                if(parseErr) { return callback('Error parsing cookies.', false); }

                // Get the SID cookie
                var sid_cookie = (handshake_data.secureCookies && handshake_data.secureCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.signedCookies && handshake_data.signedCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.cookies && handshake_data.cookies[EXPRESS_SID_KEY]);
                // local test: parse from signedCookies

                // TODO: check session authority
                // // Then we just need to load the session from the Express Session Store
                // sessionStore.load(sid_cookie, function(err, session) {
                //     // And last, we check if the used has a valid session and if he is logged in
                //     if (err || !session || session.isLogged !== true) {
                //         callback('Not logged in.', false);
                //     } else {
                //         // If you want, you can attach the session to the handshake handshake_data, so you can use it again later
                //         handshake_data.session = session;

                //         callback(null, true);
                //     }
                // });
                if (sid_cookie === undefined){
                    console.log("Same value failed!!");
                    return callback('Cookie is invalid.', false);
                }
                else {
                    handshake_data.session_id = sid_cookie;
                    callback(null, true);
                }
            });
        });
    };

    this.onSocketConnected = function(socket) {
        //transform session id, saved in tses_uuid_map
        //var tses_id = socket.handshake.cookie['express.sid'].replace(/[^\w\s]/gi, '_');
        var tses_id = socket.handshake.session_id.replace(/[^\w\s]/gi, '_');
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

    this.run = function() {
        this.server.listen(GAME_PORT, GAME_HOST, null, function(){
            console.log('Express/SocketIO server on localhost :' + GAME_PORT);
        });
    };

}

bb = new HBattleLineServer()
bb.init();
bb.run();


// interval = setInterval(function () {
//     update();
// }, 1000/30);

// function update() {

//     console.log('update called');
//     sockets.sockets.emit('update', "update!");

// };


