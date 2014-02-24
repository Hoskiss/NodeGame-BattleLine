// reference: https://github.com/leeroybrun/socketio-express-sessions
// http://socket.io/#how-to-use

function HBattleLineServer() {

    var express = require('express'),
        app = express();
    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);

    // We define the key of the cookie containing the Express SID
    var EXPRESS_SID_KEY = 'express.sid';
    // We define a secret string used to crypt the cookies sent by Express
    var COOKIE_SECRET = 'my battleline secret';
    var cookieParser = express.cookieParser(COOKIE_SECRET);
    // Create a new store in memory for the Express sessions
    var sessionStore = new express.session.MemoryStore();

    var hashes = require('hashes'),
        ses_nick_map = new hashes.HashTable();
    //var UUID = require('node-uuid');

    var HCM = require('./HCardsManager'),
        cards_mgr = new HCM.HCardsManager();

    var GAME_PORT = process.env.PORT || 8009,
        GAME_HOST = process.env.HOST || 'localhost';

    // For socket callback
    var self = this;
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
            app.use(express.bodyParser());
            app.use(cookieParser);
            app.use(express.session({
                store: sessionStore,
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
        io.set('log level', 1);
        // We configure the socket.io authorization handler (handshake)
        io.set('authorization', function (handshake_data, accept) {
            if(!handshake_data.headers.cookie) {
                console.log("No cookie!!");
                return accept('No cookie transmitted.', false);
            }

            // console.log(handshake_data.headers.cookie);
            // We use the Express cookieParser created before to parse the cookie
            // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
            // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
            cookieParser(handshake_data, null, function(parseErr) {
                if(parseErr) { return accept('Error parsing cookies.', false); }

                // Get the SID cookie
                //console.log(handshake_data);
                var sid_cookie = (handshake_data.secureCookies && handshake_data.secureCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.signedCookies && handshake_data.signedCookies[EXPRESS_SID_KEY]) ||
                                (handshake_data.cookies && handshake_data.cookies[EXPRESS_SID_KEY]);
                // console.log(sid_cookie);

                // TODO: check session authority
                // // Then we just need to load the session from the Express Session Store
                // sessionStore.load(sid_cookie, function(err, session) {
                //     // And last, we check if the used has a valid session and if he is logged in
                //     if (err || !session || session.isLogged !== true) {
                //         accept('Not logged in.', false);
                //     } else {
                //         // If you want, you can attach the session to the handshake handshake_data, so you can use it again later
                //         handshake_data.session = session;

                //         accept(null, true);
                //     }
                // });
                if (sid_cookie === undefined){
                    console.log("Some value failed!!");
                    return accept('Cookie is invalid.', false);
                }
                else {
                    handshake_data.session_id = sid_cookie;
                    accept(null, true);
                }
            });
        });
    };

    this.onSocketConnected = function(socket) {
        // var tses_id = socket.handshake.session_id.replace(/[^\w\s]/gi, '_');
        var ses_id = socket.handshake.session_id;

        if (ses_nick_map.contains(ses_id)) {
            socket.nick_name = ses_nick_map.get(ses_id).value;
        }

        else {
            // Todo: add more player
            if (ses_nick_map.count() >= 2) {
                console.log("more than two player! Disconnect!");
                socket.disconnect();
                return;
            }

            else {
                console.log("!!! New Session Connected!!");
                console.log("--- " + ses_id + " ---");

                if (0===ses_nick_map.count()) {
                    socket.nick_name = "lower";
                }
                else if (1===ses_nick_map.count()) {
                    socket.nick_name = "upper";
                }
                else {
                    console.log("Should not happen!");
                }

                // player_id = UUID();
                ses_nick_map.add(ses_id, socket.nick_name);
                console.log(ses_nick_map.count());
                console.log(ses_nick_map.get(ses_id).value);
            }
        }

        socket.on('ask first draw cards', function () {
            cards_mgr.firstDrawCardsInHand(socket.nick_name);
        });

        socket.emit('initial', {nick_name: socket.nick_name});
        //Tmp
        socket.emit('game start');

    };

    this.listen = function() {
        server.listen(GAME_PORT, GAME_HOST, null, function(){
            console.log('Express/SocketIO server on localhost :' + GAME_PORT);
        });
    };

    //TMP
    this.testServerHi = function() {
        console.log("serverHI");
    };

    this.sendfirstDrawCardsID = function(player_id){

    };
        // cards_in_hand = [ card.card_id for card in self.card_mgr.firstDrawCardsInHand(data['channel_nickname']) ]
        // self.logger.debug( data['channel_nickname'] + " firstDrawCardsID: " + str(cards_in_hand) )

        // [ player.Send({ "action": "firstDrawCardsID", "cards_in_hand": cards_in_hand })
        //   for player in self.players if player.nickname == data['channel_nickname'] ]


}

bb = new HBattleLineServer()
bb.init();
bb.listen();


// interval = setInterval(function () {
//     update();
// }, 1000/30);

// function update() {

//     console.log('update called');
//     sockets.sockets.emit('update', "update!");

// };


