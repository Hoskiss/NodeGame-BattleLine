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
    isMouseDown: false,
    helloImg: null,
    helloLabel: null,
    circle: null,
    sprite: null,

    init: function() {

        this._super();

        // this.setTouchEnabled(true);
        this.setMouseEnabled(true);

        var window_size = cc.Director.getInstance().getWinSize();
        BattleFieldLayer.WIDTH = window_size.width;
        BattleFieldLayer.HEIGHT = window_size.height;

        // add Background Map
        var background_sprite = cc.Sprite.create(s_BackgroundMap);
        background_sprite.setPosition(BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2);

        BattleFieldLayer.SCALE = (BattleFieldLayer.HEIGHT)/(background_sprite.getContentSize().height);
        background_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(background_sprite, 0);

        // add static cards
        var soldier_back_sprite = cc.Sprite.create(s_SoldierBack);
        soldier_back_sprite.setPosition(1176, 478);
        soldier_back_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(soldier_back_sprite, 0);

        var tactics_back_sprite = cc.Sprite.create(s_TacticsBack);
        tactics_back_sprite.setPosition(105, 325);
        tactics_back_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(tactics_back_sprite, 0);

        // var aide_sprite = cc.Sprite.create(s_Aide);
        // aide_sprite.setPosition(105, 325);
        // aide_sprite.setScale(BattleFieldLayer.SCALE);
        // this.addChild(aide_sprite, 0);

        ////////////////
        //tmp
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window window_size


        // add a "close" icon to exit the progress. it's an autorelease object
        // var closeItem = cc.MenuItemImage.create(
        //     s_CloseNormal,
        //     s_CloseSelected,
        //     function () {
        //         cc.log("close");
        //     },this);
        // closeItem.setAnchorPoint(0.5, 0.5);

        // var menu = cc.Menu.create(closeItem);
        // menu.setPosition(0, 0);
        // this.addChild(menu, 1);
        // closeItem.setPosition(window_size.width - 20, 20);
        ////////////////

        this.mouse_x = 0;
        this.mouse_y = 0;

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
        this.rival_picked_card = undefined;

        // only tactics re-rearrange kind would in these list (not in each line)
        this.cards_self_tactics = [];
        this.cards_rival_tactics = [];
        this.self_tactics_pos = (1276, 469);
        this.rival_tactics_pos = (72, 297);

        // Tactics
        this.tactics_self_num_on_battle = 0;
        this.wildcard_used = false;
        this.which_line_fog = -1;
        this.which_line_mud = -1;
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

        this.win_outcome_each_line = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        this.game_state = BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE;

        this.is_anim_scheduled = false;
        this.translucent_card = undefined;
        //////////////////


        ////////////////
        // SOCKET IO CALLBACK
        var server_host = document.domain;
        var game_port = document.location.port;

        this.socket = io.connect(server_host,
                                 {port: game_port, transports: ["websocket"]});

        this.socket.on('connect', function() {
            console.log('connected!');
        }.bind(this));

        this.socket.on('initial', function(data) {
            //gloabal
            //window.player_id = msg.player_id;
            console.log("my player_id: " + data.nickname);
        }.bind(this));

        this.socket.on('game start', function(data) {
            console.log("Game start!!");
            this.socket.emit('ask first draw cards');
            this.socket.emit('ask init game state');
        }.bind(this));

        this.socket.on('first draw cards ID', function(data) {
            //gloabal
            //window.player_id = msg.player_id;
            data.cards_in_hand_id.sort(HRenderCard.sortCardByID);
            // console.log(data.cards_in_hand_id);
            for (var index = 0; index < data.cards_in_hand_id.length; index++) {
                var hand_card = new HRenderCard(data.cards_in_hand_id[index]+".png",
                                                BattleFieldLayer.SELF_IN_HAND_POS[index+1],
                                                BattleFieldLayer.SCALE);
                this.cards_in_hand.push(hand_card);
                this.addChild(hand_card);
            }

            this.rival_picked_card = cc.Sprite.create(s_SoldierBack);
            this.rival_picked_card.setPosition(784, 735);
            this.rival_picked_card.setScale(BattleFieldLayer.SCALE);
            this.rival_picked_card.setVisible(false);
            this.addChild(this.rival_picked_card, 0);
        }.bind(this));

        this.socket.on('update picked card pos', function(data) {
            this.updateRivalPickedCardPos(data.picking_pos,
                                          data.card_state,
                                          data.is_rearrange);
        }.bind(this));

        this.socket.on('state change', function(data) {
            this.game_state = data.game_state;
        }.bind(this));

    },



    // onTouchesEnded:function (pTouch, pEvent){
    //     //console.log(pTouch[0].getLocation());
    // },
    // onTouchesMoved:function(pTouch, pEvent){
    //     //this._jetSprite.handleTouchMove(pTouch[0].getLocation());
    // },

    onMouseMoved: function(event){
        var location = event.getLocation();
        this.mouse_x = location.x;
        this.mouse_y = location.y;

        this.checkCardsInHand();
        this.updatePickedCardPos();
        this.checkRenderTranslucentCard();
    },

    onMouseDown: function(event) {
        var location = event.getLocation();
        this.checkPickUpCardInHand(location.x, location.y);
    },

    onRightMouseDown: function(event) {
        console.log("EEEEEEEEEEEEE");
        console.log(event);
    },

    onMouseUp:function (event) {
        console.log("SSSSSS");
    },

    checkCardsInHand: function() {
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE ||
            this.picking_card !== undefined) {
            if (this.is_anim_scheduled) {
                this.unschedule(this.checkCardsInHandAnim);
                this.is_anim_scheduled = false;
            }
            return;
        }

        if (!this.is_anim_scheduled) {
            this.schedule(this.checkCardsInHandAnim);
            this.is_anim_scheduled = true;
        }
    },

    checkCardsInHandAnim: function() {
        for (var index = 0; index < this.cards_in_hand.length; index++) {
            var curr_pos = this.cards_in_hand[index].getPosition();

            if (this.cards_in_hand[index].isTouch(this.mouse_x, this.mouse_y) &&
                curr_pos.y < BattleFieldLayer.HANDCARD_ANIMATION_UPPERBOUND) {
                this.cards_in_hand[index].setPosition(
                    curr_pos.x, curr_pos.y+BattleFieldLayer.ANIMATION_OFFSET);
            }
            else if (!this.cards_in_hand[index].isTouch(this.mouse_x, this.mouse_y) &&
                curr_pos.y > BattleFieldLayer.HANDCARD_ANIMATION_LOWERBOUND) {
                this.cards_in_hand[index].setPosition(
                    curr_pos.x, curr_pos.y-BattleFieldLayer.ANIMATION_OFFSET);
            }
        }
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
            if (this.is_anim_scheduled) {
                this.unschedule(this.checkCardsInHandAnim);
                this.is_anim_scheduled = false;
            }

            this.picking_card = this.cards_in_hand.splice(index, 1)[0];
            this.picking_card.setPosition(mouse_x,
                                          mouse_y+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);
            if ( this.picking_card.isTacticsReArrange() ) {
                this.need_instruction_place = true;
            }
            // #generate translucent card
            // if(self.translucent_card != None):
            //     self.translucent_card.kill
            // self.translucent_card = TranslucentCard(self.picking_card.card_id, (0, 0))
            // self.translucent_group.add(self.translucent_card)
        }
    },

    updatePickedCardPos: function() {
        if (this.picking_card !== undefined && this.picking_card.state === "PICKED") {
            this.picking_card.setPosition(this.mouse_x,
                                          this.mouse_y+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);

            var picking_card_pos = this.picking_card.getPosition();
            this.sendOutPickedCardPos({x: picking_card_pos.x, y: picking_card_pos.y},
                                      this.picking_card.state,
                                      this.picking_card.isTacticsReArrange())
        }
        else {
            return;
        }
    },

    sendOutPickedCardPos: function(picking_pos, card_state, is_rearrange) {
        this.socket.emit('update picked card pos', {
            picking_pos: picking_pos,
            card_state: card_state,
            is_rearrange: is_rearrange
        });
    },

    updateRivalPickedCardPos: function(picking_pos, card_state, is_rearrange) {
        if (is_rearrange) {
            this.rival_picked_card.setPosition(
                BattleFieldLayer.WIDTH-picking_pos.x,
                BattleFieldLayer.HEIGHT-picking_pos.y);
        }
        else {
            this.rival_picked_card.setPosition(
                picking_pos.x, BattleFieldLayer.HEIGHT-picking_pos.y);
        }

        this.rival_picked_card.setVisible(true);
        this.rival_picked_card.state = card_state;
    },

    isCurrentStateSelf: function() {
        if (this.game_state.indexOf("SELF") !== -1) {
            return true;
        }
        return false;
    },

    isMouseInRange: function(center_pos, lower_bound, upper_bound) {
        lower_bound = (typeof lower_bound === "undefined") ? 0 : lower_bound;
        upper_bound = (typeof upper_bound === "undefined") ? 0 : upper_bound;
        if ( this.mouse_x > center_pos[0]-HRenderCard.WIDTH/2 &&
             this.mouse_x < center_pos[0]+HRenderCard.WIDTH/2 &&
             this.mouse_y > center_pos[1]-HRenderCard.HEIGHT/2-lower_bound &&
             this.mouse_y < center_pos[1]+HRenderCard.HEIGHT/2+upper_bound ) {
            return true;
        }
        return false;
    },

    checkRenderTranslucentCard: function() {
        if (!this.isCurrentStateSelf() || this.picking_card === undefined) {
            return;
        }

        if (this.picking_card.isTacticsReArrange()) {
            if (this.isMouseInRange(this.self_tactics_pos,
                                    BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT) ) {

                if (undefined !== this.translucent_card) {
                    if (this.translucent_card.getPosition().x ===
                        this.self_tactics_pos[0]) {
                        return;
                    } else {
                        this.removeChild(this.translucent_card, true);
                        this.translucent_card = undefined;
                    }
                }

                this.translucent_card = new HRenderCard(
                    this.picking_card.card_id,
                    this.self_tactics_pos,
                    BattleFieldLayer.SCALE);
                this.translucent_card.setOpacity(BattleFieldLayer.TRANSLUCENT_ALPHA);
                this.addChild(this.translucent_card);
                return;
            }
        } else if (this.picking_card.isTacticsEnvironment()) {
            // TODO: beautiful effect
            for (var index=0; index < BattleFieldLayer.MIDDLE_ENVIRONMENT_POS.length; index++) {
                if (!this.isMouseInRange(BattleFieldLayer.MIDDLE_ENVIRONMENT_POS[index],
                                         BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT,
                                         BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT)) {
                    continue;
                }
                if (undefined !== this.translucent_card) {
                    return;
                }

                this.translucent_card = new HRenderCard(
                    this.picking_card.card_id,
                    BattleFieldLayer.MIDDLE_ENVIRONMENT_POS[index],
                    BattleFieldLayer.SCALE);
                this.translucent_card.setOpacity(BattleFieldLayer.TRANSLUCENT_ALPHA);
                this.addChild(this.translucent_card);
                return;
            }
        } else {
            for (var index=0; index < BattleFieldLayer.SELF_BATTLE_LINE_POS.length; index++) {
                if (!this.isMouseInRange(BattleFieldLayer.SELF_BATTLE_LINE_POS[index],
                                         BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT*3,
                                         BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT)) {
                    continue;
                }

                if (undefined !== this.translucent_card) {
                    if (this.translucent_card.getPosition().x ===
                        BattleFieldLayer.SELF_BATTLE_LINE_POS[index][0]) {
                        return;
                    } else {
                        this.removeChild(this.translucent_card, true);
                        this.translucent_card = undefined;
                    }
                }
                this.translucent_card = new HRenderCard(
                    this.picking_card.card_id,
                    BattleFieldLayer.SELF_BATTLE_LINE_POS[index],
                    BattleFieldLayer.SCALE);
                this.translucent_card.setOpacity(BattleFieldLayer.TRANSLUCENT_ALPHA);
                this.addChild(this.translucent_card, 1);
                return;
            }
        }

        this.removeChild(this.translucent_card, true);
        this.translucent_card = undefined;
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
BattleFieldLayer.MIDDLE_ENVIRONMENT_POS = [[213, 400], [319, 400], [426, 400],
                                          [532, 400], [639, 400], [746, 400],
                                          [852, 400], [958, 400], [1065, 400]];

// Animation
BattleFieldLayer.HANDCARD_ANIMATION_UPPERBOUND = 103;
BattleFieldLayer.HANDCARD_ANIMATION_LOWERBOUND = 80;
BattleFieldLayer.ANIMATION_OFFSET = 3;
BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT = (HRenderCard.HEIGHT/4);

// decorated color
BattleFieldLayer.FOCUS_EDGE_ORANGE = (250, 128, 10);
BattleFieldLayer.INSTRUCTION_PLACE_BLUE = (0, 0, 250);
BattleFieldLayer.FOCUS_EDGE_WIDTH = 3;

BattleFieldLayer.TRANSLUCENT_ALPHA = 128;

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
        spriteFrameCache.addSpriteFrames(s_CardsPlist, s_Cards);

        var layer = new BattleFieldLayer();
        this.addChild(layer);
        layer.init();
    }
});
