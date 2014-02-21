/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var BattleFieldLayer = cc.Layer.extend({
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    init: function() {

        this._super();
        // this.setTouchEnabled(true);
        this.setMouseEnabled(true);

        // add Background Map
        var window_size = cc.Director.getInstance().getWinSize();
        var background_sprite = cc.Sprite.create(s_BackgroundMap);
        background_sprite.setPosition(window_size.width / 2, window_size.height / 2);
        // total scale based on background scale
        this.scale = (window_size.height)/(background_sprite.getContentSize().height);
        background_sprite.setScale(this.scale);
        this.addChild(background_sprite, 0);

        ////////////////
        //tmp
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window window_size


        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            s_CloseNormal,
            s_CloseSelected,
            function () {
                cc.log("close");
            },this);
        closeItem.setAnchorPoint(0.5, 0.5);

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(0, 0);
        this.addChild(menu, 1);
        closeItem.setPosition(window_size.width - 20, 20);
        ////////////////


        // attributes
        this.cards_in_hand = [];
        this.cards_on_self_field = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_self_field.length; index++) {
            this.cards_on_self_field[index] = new Array();
        }
        this.cards_on_rival_field = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_rival_field.length; index++) {
            this.cards_on_rival_field[index] = new Array();
        }

        this.picking_card = undefined;
        this.rival_picked_card = HRenderCard(this.SOLDIER_BACK_NAME);

        // only tactics re-rearrange kind would in these list (not in each line)
        this.cards_self_tactics = [];
        this.cards_rival_tactics = [];
        this.self_tactics_pos = (1276, 469);
        this.rival_tactics_pos = (72, 297);

        // Tactics
        this.tactics_self_num_on_battle = 0;
        this.wildcard_used = false;
        this.which_line_in_fog_environment = -1;
        this.which_line_in_mud_environment = -1;
        // For render...should be more pretty
        this.middle_fog_tactics_card = undefined;
        this.middle_mud_tactics_card = undefined;
        // hold for some actions after use tactics
        this.latest_tactics_card = undefined;
        // special draw card count for scout tactics
        this.scout_draw_card_count = 0;
        this.scout_return_card_count = 0;

        // for (query)actions after tactics
        this.need_instruction_place = undefined;
        this.query_text_box = undefined;
        this.query_color_selector_box = undefined;
        this.query_number_selector_box = undefined;

        // translucent_surface
        this.win_outcome_each_line = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        // this.game_state = BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE;
        // tmp
        this.game_state = BattleFieldLayer.SELF_SHOULD_MOVE_STATE;

        //////////////////


        ////////////////
        // SOCKET IO CALLBACK
        var server_host = document.domain;
        var game_port = document.location.port;
        var socket = io.connect(server_host,
                                 {port: game_port, transports: ["websocket"]});

        socket.on('connect', function() {
            console.log('connected!');
        }.bind(this));

        socket.on('initial', function(data) {
            //gloabal
            //window.player_id = msg.player_id;
            console.log("my player_id: " + data.player_id);
        }.bind(this));

        socket.on('game start', function(data) {
            socket.emit('ask first draw cards');
            socket.emit('ask init game state');
        }.bind(this));

        //socket.emit('ask first draw cards');
        ////////////////

        for (var index = 0; index < BattleFieldLayer.RIVAL_BATTLE_LINE_POS.length; index++) {
            var test_card = new HRenderCard("Blue_1.png",
                                            BattleFieldLayer.RIVAL_BATTLE_LINE_POS[index],
                                            this.scale);
            this.addChild(test_card);
            //Do something
        }

        for (var index = 1; index < BattleFieldLayer.SELF_IN_HAND_POS.length-1; index++) {
            var test_card = new HRenderCard("Blue_1.png",
                                            BattleFieldLayer.SELF_IN_HAND_POS[index],
                                            this.scale);

            this.addChild(test_card);

            this.cards_in_hand.push(test_card);

            //Do something
        }

        //test_card.setScale(window_size.height/test_card.getContentSize().height);
        this.addChild(test_card);

        this.test_sprite = cc.Sprite.createWithSpriteFrameName("Blue_7.png");
        this.test_sprite.setPosition(319, 325);
        this.test_sprite.setScale(this.scale);
        //this.test_sprite.setScale(3);
        this.addChild(this.test_sprite);
    },

    testHi: function(){
        console.log("HIHIHIHIHIHIHIHIHIIIIIIIIII");
    },

    onMouseMoved: function(event){
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE) {
            return;
        }
        if (this.picking_card !== undefined) {
            return;
        }

        var location = event.getLocation();
        for (var index = 0; index < this.cards_in_hand.length; index++) {
            this.cards_in_hand[index].onMouseAnimation(
                location.x, location.y,
                BattleFieldLayer.HANDCARD_ANIMATION_UPPERBOUND,
                BattleFieldLayer.HANDCARD_ANIMATION_LOWERBOUND,
                BattleFieldLayer.ANIMATION_OFFSET);
        }
    },

    onMouseDown: function(event) {


        var location = event.getLocation();

        // left click event could triger pick/move(put)/draw
        this.checkPickUpCardInHand(location.x, location.y);
        // self.checkMoveCardInHand(mouse_x, mouse_y)

        // self.checkGenerateQueryBoxAfterTactics(mouse_x, mouse_y)
        // self.checkConfirmTextBox(mouse_x, mouse_y)
        // self.checkDrawCard(mouse_x, mouse_y)
    },

    onRightMouseDown: function(event) {
        console.log("EEEEEEEEEEEEE");
        console.log(event);
    },

    countSelfTacticsNumOnBattle: function() {
        var count = 0
        for (var line_index=0; line_index<this.cards_on_self_field.length; line_index++) {
            for (var card_index=0; card_index<this.cacards_on_self_field[line_index].length; card_index++) {
                if (this.cacards_on_self_field[line_index][card_index].isTactics()) {
                    count += 1;
                }
            }
        }
        for (var card_index=0; card_index<this.cards_self_tactics.length; card_index++) {
            if (this.cards_self_tactics[card_index].isTactics()) {
                count += 1;
            }
        }
        return count;
    },

    countRivalTacticsNumOnBattle: function() {
        var count = 0
        for (var line_index=0; line_index<this.cards_on_rival_field.length; line_index++) {
            for (var card_index=0; card_index<this.cards_on_rival_field[line_index].length; card_index++) {
                if (this.cards_on_rival_field[line_index][card_index].isTactics()) {
                    count += 1;
                }
            }
        }
        for (var card_index=0; card_index<this.cards_rival_tactics.length; card_index++) {
            if (this.cards_rival_tactics[card_index].isTactics()) {
                count += 1;
            }
        }
        return count;
    },

    checkPickUpCardInHand: function(mouse_x, mouse_y) {
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE) {
            return;
        }

        for (var index = 0; index < this.cards_in_hand.length; index++) {
            if ( this.picking_card !== undefined ) {
                continue;
            }
            if ( this.cards_in_hand[index].isTacticsWildCard() &&
                 this.wildcard_used ) {
                continue;
            }
            if ( this.cards_in_hand[index].isTactics() &&
                 this.countSelfTacticsNumOnBattle() > this.countRivalTacticsNumOnBattle() ) {
                continue;
            }
            if ( !this.cards_in_hand[index].isTouch(mouse_x, mouse_y) ) {
                continue;
            }

            this.cards_in_hand[index].state = "PICKED";
            this.picking_card = this.cards_in_hand[index];
            // assign undefined to this elem in array
            delete this.cards_in_hand[index];
            console.log(this.picking_card.card_id);

            if ( this.picking_card.isTacticsReArrange() ) {
                this.need_instruction_place = true;
            }
            // #generate translucent card
            // if(self.translucent_card != None):
            //     self.translucent_card.kill
            // self.translucent_card = TranslucentCard(self.picking_card.card_id, (0, 0))
            // self.translucent_group.add(self.translucent_card)
        }


    }


});

// Add first and last pos for scout
BattleFieldLayer.BATTLE_LINE_TOTAL_NUM = 9;
// From near to far
BattleFieldLayer.SELF_IN_HAND_POS = [[160, 80], [260, 80], [360, 80],
                                     [460, 80], [560, 80], [660, 80],
                                     [760, 80], [860, 80], [960, 80]];
BattleFieldLayer.SELF_BATTLE_LINE_POS = [[213, 325], [319, 325], [426, 325],
                                         [532, 325], [639, 325], [746, 325],
                                         [852, 325], [958, 325], [1065, 325]];
BattleFieldLayer.RIVAL_BATTLE_LINE_POS = [[213, 478], [319, 478], [426, 478],
                                          [532, 478], [639, 478], [746, 478],
                                          [852, 478], [958, 478], [1065, 478]];

// Static card
BattleFieldLayer.SOLDIER_BACK = HRenderCard("Soldier_Back",
                                            (1275, 293));

BattleFieldLayer.TACTICS_BACK = HRenderCard("Tactics_Back",
                                            (70, 465));

BattleFieldLayer.AIDE_CARD = HRenderCard("Aide",
                                         (1154, 745));

// Animation
BattleFieldLayer.HANDCARD_ANIMATION_UPPERBOUND = 715;
BattleFieldLayer.HANDCARD_ANIMATION_LOWERBOUND = 745;
BattleFieldLayer.ANIMATION_OFFSET = 3;
BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT = (HRenderCard.HEIGHT/4);

// decorated color
BattleFieldLayer.FOCUS_EDGE_ORANGE = (250, 128, 10);
BattleFieldLayer.INSTRUCTION_PLACE_BLUE = (0, 0, 250);
BattleFieldLayer.FOCUS_EDGE_WIDTH = 3;

// For win-lose result
BattleFieldLayer.MINIMUM_CARDS_NUM_FOR_CATEGARY = 3;

BattleFieldLayer.SELF_SHOULD_MOVE_STATE = 'SELF_SHOULD_MOVE_STATE';
BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE = 'SELF_MOVE_AFTER_TACTICS_STATE';
BattleFieldLayer.SELF_MOVE_DONE_STATE = 'SELF_MOVE_DONE_STATE';
BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE = 'RIVAL_SHOULD_MOVE_STATE';
BattleFieldLayer.RIVAL_MOVE_AFTER_TACTICS_STATE = 'RIVAL_MOVE_AFTER_TACTICS_STATE';
BattleFieldLayer.RIVAL_MOVE_DONE_STATE = 'RIVAL_MOVE_DONE_STATE';
BattleFieldLayer.GAME_OVER_STATE = 'GAME_OVER_STATE';

// BattleFieldLayer.prototype = {
//     renderCard: function(card_id, card_pos, card_state, rotate) {
//         var COLOR_LIST = ['Red', 'Orange', 'Yellow',
//                           'Green', 'Blue', 'Purple'];
//         return (COLOR_LIST.indexOf(card_id.match(/^[a-z]+/i)[0]));
//     }
// }

var HBattleLineScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var spriteFrameCache = cc.SpriteFrameCache.getInstance();
        spriteFrameCache.addSpriteFrames("HBL-Cards.plist", "HBL-Cards.png");

        var layer = new BattleFieldLayer();
        this.addChild(layer);
        layer.init();
    }
});
