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

        ////////////////
        //game port should pass in init
        // socket io connect
        var GAME_PORT = 8009;
        var server_host = document.domain;
        this.socket = io.connect(server_host,
                                 {port: GAME_PORT, transports: ["websocket"]});

        this.socket.on('connect', function() {
            console.log('connected!')
        });

        this.socket.on('initial', function(data) {
            //gloabal
            //window.player_id = msg.player_id;
            console.log("my player_id: " + data.player_id);
        });
        //////
        ////////////////


        this.CARD_ORDER = ['Red', 'Orange', 'Yellow',
                           'Green', 'Blue', 'Purple', 'Tactics']

        // add first and last pos for scout
        this.BATTLE_LINE_TOTAL_NUM = 9

        this.SELF_IN_HAND_POS = [[160, 80], [260, 80], [360, 80],
                                 [460, 80], [560, 80], [660, 80],
                                 [760, 80], [860, 80], [960, 80]];

        this.SELF_BATTLE_LINE_POS = [[213, 325], [319, 325], [426, 325],
                                     [532, 325], [639, 325], [746, 325],
                                     [852, 325], [958, 325], [1065, 325]];

        this.RIVAL_BATTLE_LINE_POS = [[213, 478], [319, 478], [426, 478],
                                     [532, 478], [639, 478], [746, 478],
                                     [852, 478], [958, 478], [1065, 478]];

        this.cards_in_hand = [];
        this.cards_on_self_field = new Array(this.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_self_field.length; index++) {
            this.cards_on_self_field[index] = new Array();
        }
        this.cards_on_rival_field = new Array(this.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_rival_field.length; index++) {
            this.cards_on_rival_field[index] = new Array();
        }

        // only tactics re-rearrange kind would in these list
        this.cards_self_tactics = [];
        this.cards_rival_tactics = [];

        this.cards_back = [];
        this.tactics_self_num_on_battle = 0;


        this.win_outcome_on_each_line = new Array(this.BATTLE_LINE_TOTAL_NUM);

        this.HANDCARD_ANIMATION_UPPERBOUND = 104;
        this.HANDCARD_ANIMATION_LOWERBOUND = 80;
        this.ANIMATION_OFFSET = 5;

        this.game_state = BattleFieldLayer.SELF_SHOULD_MOVE_STATE;
        this.picking_card = undefined;

        this.wildcard_used = false;

        this.need_instruction_place = undefined;

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

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
        closeItem.setPosition(size.width - 20, 20);


        this.setMouseEnabled(true);
        // this.setTouchEnabled(true);

        // add Background Map
        this.sprite = cc.Sprite.create(s_BackgroundMap);
        this.sprite.setAnchorPoint(0.5, 0.5);
        this.sprite.setPosition(size.width / 2, size.height / 2);
        // total scale based on background scale
        this.scale = size.height/this.sprite.getContentSize().height;
        this.sprite.setScale(this.scale);
        this.addChild(this.sprite, 0);



        for (var index = 0; index < this.RIVAL_BATTLE_LINE_POS.length; index++) {
            var test_card = new HRenderCard("Blue_1.png",
                                            this.RIVAL_BATTLE_LINE_POS[index],
                                            this.scale);
            this.addChild(test_card);
            //Do something
        }

        for (var index = 1; index < this.SELF_IN_HAND_POS.length-1; index++) {
            var test_card = new HRenderCard("Blue_1.png",
                                            this.SELF_IN_HAND_POS[index],
                                            this.scale);

            this.addChild(test_card);

            this.cards_in_hand.push(test_card);

            //Do something
        }

        //test_card.setScale(size.height/test_card.getContentSize().height);
        this.addChild(test_card);

        this.test_sprite = cc.Sprite.createWithSpriteFrameName("Blue_7.png");
        this.test_sprite.setPosition(319, 325);
        this.test_sprite.setScale(this.scale);
        //this.test_sprite.setScale(3);
        this.addChild(this.test_sprite);
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
                this.HANDCARD_ANIMATION_UPPERBOUND,
                this.HANDCARD_ANIMATION_LOWERBOUND,
                this.ANIMATION_OFFSET);

        }
        // redCircle.setPosition(location);
        // this.test_sprite.setPosition(location);
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

BattleFieldLayer.SELF_SHOULD_MOVE_STATE = 'SELF_SHOULD_MOVE_STATE'
BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE = 'SELF_MOVE_AFTER_TACTICS_STATE'
BattleFieldLayer.SELF_MOVE_DONE_STATE = 'SELF_MOVE_DONE_STATE'
BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE = 'RIVAL_SHOULD_MOVE_STATE'
BattleFieldLayer.RIVAL_MOVE_AFTER_TACTICS_STATE = 'RIVAL_MOVE_AFTER_TACTICS_STATE'
BattleFieldLayer.RIVAL_MOVE_DONE_STATE = 'RIVAL_MOVE_DONE_STATE'
BattleFieldLayer.GAME_OVER_STATE = 'GAME_OVER_STATE'

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
        spriteFrameCache.addSpriteFrames("HBL-Cards.plist","HBL-Cards.png");

        var layer = new BattleFieldLayer();
        this.addChild(layer);
        layer.init();
    }
});
