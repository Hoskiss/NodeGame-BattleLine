function HBattleLineServer() {

    var express = require('express'),
        app = express();
        // Create a new store in memory for the Express sessions
    var sessionStore = new express.session.MemoryStore();

    // We define the key of the cookie containing the Express SID
    var EXPRESS_SID_KEY = 'express.sid';
    // We define a secret string used to crypt the cookies sent by Express
    var COOKIE_SECRET = 'my battleline secret';
    var cookieParser = express.cookieParser(COOKIE_SECRET);

    var io = require('socket.io');
    var http = require('http');
        //cookie = require("cookie"),
        //connect = require("connect");
    //var parseCookie = require('cookie').parse;


    var hashes = require('hashes'),
        tses_uuid_map = new hashes.HashTable();
    var UUID = require('node-uuid');

    // var c_m = require('./HCardsManager');
    // c1 = new c_m.CardCategory([["aa", 1], ["aa", 2], ["aa", 90] ]);
    // c2 = new c_m.CardCategory([["bb", 10], ["bb", 20], ["bb", 90] ]);
    // console.log(c1.lessThan(c2));

    // c1 = new c_m.Card("dsa-fas-4232");
    // c2 = new c_m.Card("dsa-fas-5631");



    var GAME_PORT = 8009;



    this.init = function() {
        this.game_start = false;


        this.configureExpress();
        this.configureSocketIO();
        console.log("!!!BBB");

        io.sockets.on("connection", this.onSocketConnected);
        this.server.listen(GAME_PORT, function(){
            console.log('Express/SocketIO server on localhost :' + app.get('port'));
        });
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
            //app.use(express.bodyParser());
            //app.use(express.cookieParser(COOKIE_SECRET));
            app.use(express.cookieParser);
            app.use(express.session({
                store: sessionStore,
                cookie: {
                    httpOnly: true
                },
                key: EXPRESS_SID_KEY

            }));

            app.get('/', function(req, res){
                res.sendfile('index.html');
                console.log('Sent index.html');
            });
        });
    };

    this.configureSocketIO = function() {
        this.server = http.createServer(app);
        io = io.listen(this.server);
        // io = io.listen( server.listen(app.get('port'), function(){
        //     console.log('Express/SocketIO server on localhost :' + app.get('port'));
        // }));

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
                var sidCookie = (handshake_data.secureCookies && handshake_data.secureCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.signedCookies && handshake_data.signedCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.cookies && handshake_data.cookies[EXPRESS_SID_KEY]);

                // Then we just need to load the session from the Express Session Store
                sessionStore.load(sidCookie, function(err, session) {
                    // And last, we check if the used has a valid session and if he is logged in
                    if (err || !session || session.isLogged !== true) {
                        callback('Not logged in.', false);
                    } else {
                        // If you want, you can attach the session to the handshake handshake_data, so you can use it again later
                        handshake_data.session = session;

                        callback(null, true);
                    }
                });
            });
        });
        //     // if there is, parse the cookie
        //     handshake_data.cookie = parseCookie(handshake_data.headers.cookie);

        //     console.log("!!");
        //     console.log(handshake_data.cookie);
        //     console.log("!!");
        //     // the cookie value should be signed using the secret configured above (see line 17).
        //     // use the secret to to decrypt the actual session id.
        //     handshake_data.sessionID = connect.utils.parseSignedCookie(handshake_data.cookie['express.sid'], 'secret');
        //     // if the session id matches the original value of the cookie, this means that
        //     // we failed to decrypt the value, and therefore it is a fake.
        //     if (handshake_data.cookie['express.sid'] == handshake_data.sessionID) {
        //         // reject the handshake
        //         console.log("Same value failed!!");
        //         return callback('Cookie is invalid.', false);
        //     }



        //     // callback the incoming connection
        //     callback(null, true);
        // });
        console.log("!!!AAA");
    };

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


