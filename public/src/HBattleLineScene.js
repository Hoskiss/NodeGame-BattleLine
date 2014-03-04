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

    initLayerValue: function() {
        var window_size = cc.Director.getInstance().getWinSize();
        BattleFieldLayer.WIDTH = window_size.width;
        BattleFieldLayer.HEIGHT = window_size.height;

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
        BattleFieldLayer.SOLDIER_BACK_POS = [1176, 478];
        BattleFieldLayer.TACTICS_BACK_POS = [105, 325];
        BattleFieldLayer.SELF_TACTICS_POS = [1176, 325];
        BattleFieldLayer.RIVAL_TACTICS_POS = [105, 478];

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
    },

    init: function() {

        this._super();
        this.initLayerValue();
        // global var
        // for action function
        self = this;
        // for draw primitives
        draw = cc.DrawNode.create();
        this.addChild(draw, 1);

        // this.setTouchEnabled(true);
        this.setMouseEnabled(true);
        this.mouse_x = 0;
        this.mouse_y = 0;

        // add Background Map
        var background_sprite = cc.Sprite.create(s_BackgroundMap);
        background_sprite.setPosition(BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2);

        BattleFieldLayer.SCALE = (BattleFieldLayer.HEIGHT)/(background_sprite.getContentSize().height);
        background_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(background_sprite, 0);

        // attributes
        this.cards_in_hand = [];
        this.cards_on_self_battle = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_self_battle.length; index++) {
            this.cards_on_self_battle[index] = new Array();
        }
        this.cards_on_rival_battle = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        for (var index=0; index < this.cards_on_rival_battle.length; index++) {
            this.cards_on_rival_battle[index] = new Array();
        }

        // add static cards
        // var aide_sprite = cc.Sprite.create(s_Aide);
        // aide_sprite.setPosition(105, 325);
        // aide_sprite.setScale(BattleFieldLayer.SCALE);
        // this.addChild(aide_sprite, 0);

        this.soldier_back_sprite = cc.Sprite.create(s_SoldierBack);
        this.soldier_back_sprite.setPosition(BattleFieldLayer.SOLDIER_BACK_POS[0],
                                        BattleFieldLayer.SOLDIER_BACK_POS[1]);
        this.soldier_back_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(this.soldier_back_sprite, 0);

        this.tactics_back_sprite = cc.Sprite.create(s_TacticsBack);
        this.tactics_back_sprite.setPosition(BattleFieldLayer.TACTICS_BACK_POS[0],
                                        BattleFieldLayer.TACTICS_BACK_POS[1]);
        this.tactics_back_sprite.setScale(BattleFieldLayer.SCALE);
        this.addChild(this.tactics_back_sprite, 0);

        this.picking_card = undefined;
        this.rival_picked_card = undefined;

        // Tactics
        // only tactics re-rearrange kind would in these list (not in each line)
        this.cards_self_tactics = [];
        this.cards_rival_tactics = [];
        // For render...should be more pretty
        this.middle_fog_tactics_card = undefined;
        this.middle_mud_tactics_card = undefined;

        this.tactics_self_num_on_battle = 0;
        this.wildcard_used = false;
        this.need_instruction_place = false;
        this.which_line_fog = -1;
        this.which_line_mud = -1;
        // hold for some actions after use tactics
        this.latest_tactics_card = undefined;
        // special draw card count for scout tactics
        this.scout_draw_card_count = 0;
        this.scout_return_card_count = 0;


        // query/selector for tactics
        this.query_text = undefined;
        // var label = cc.LabelTTF.create("中国", "Microsoft Yahei", 30);
        // label.setPosition(winSize.width / 2, winSize.height / 3 * 2);
        // this.addChild(label);

        // always binding with query_text
        this.yes_no_selector_sprite = new HSelector(
            s_YesNoSelector,
            [BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2+76],
            BattleFieldLayer.SCALE);

        this.color_selector_sprite = new HSelector(
            s_ColorSelector,
            [BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2+172],
            BattleFieldLayer.SCALE);

        this.num_all_selector_sprite = new HSelector(
            s_NumAllSelector,
            [BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2+172],
            BattleFieldLayer.SCALE);
        //this.addChild(this.num_all_selector_sprite);

        this.num_123_selector_sprite = new HSelector(
            s_Num123Selector,
            [BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2+172],
            BattleFieldLayer.SCALE);
        //this.addChild(this.num_123_selector_sprite);

        this.is_query_text = false;
        this.is_color_selector = false;
        this.is_num_all_selector = false;
        this.is_num_123_selector = false;

        // for schedule
        this.is_anim_scheduled = false;
        this.is_release_scheduled = false;

        this.translucent_card = undefined;
        this.is_translucent_draw = false;

        this.win_outcome_each_line = new Array(BattleFieldLayer.BATTLE_LINE_TOTAL_NUM);
        this.game_state = BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE;

        //////////////////

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

        this.socket.on('state change', function(data) {
            console.log("state change!!");
            this.game_state = data.game_state;
        }.bind(this));

        this.socket.on('first draw cards ID', function(data) {
            //gloabal
            //window.player_id = msg.player_id;
            data.cards_in_hand_id.sort(HRenderCard.sortCardByID);
            for (var index=0; index < data.cards_in_hand_id.length; index++) {
                var hand_card = new HRenderCard(data.cards_in_hand_id[index],
                                                BattleFieldLayer.SELF_IN_HAND_POS[index+1],
                                                BattleFieldLayer.SCALE);
                this.cards_in_hand.push(hand_card);
                this.addChild(hand_card);
            }

            this.rival_picked_card = cc.Sprite.create(s_SoldierBack);
            this.rival_picked_card.setPosition(784, 735);
            this.rival_picked_card.setScale(BattleFieldLayer.SCALE);
            this.rival_picked_card.setVisible(false);
            this.rival_picked_card.state = HRenderCard.LAZY_STATE;
            this.addChild(this.rival_picked_card, 0);
        }.bind(this));

        this.socket.on('set picked card', function(data) {
            this.rival_picked_card.setPosition(BattleFieldLayer.WIDTH-data.picking_pos[0],
                                               BattleFieldLayer.HEIGHT-data.picking_pos[1]);
            this.rival_picked_card.state = data.card_state;
            if (data.card_state === HRenderCard.PICKED_STATE) {
                this.rival_picked_card.setVisible(true);
            } else if (data.card_state === HRenderCard.LAZY_STATE) {
                this.rival_picked_card.setVisible(false);
            }
        }.bind(this));

        this.socket.on('update picked card pos', function(data) {
            this.rival_picked_card.setPosition(
                BattleFieldLayer.WIDTH-data.picking_pos[0],
                BattleFieldLayer.HEIGHT-data.picking_pos[1]);
        }.bind(this));

        this.socket.on('update cards on self battle', function(data) {
            this.updateRivalCardsOnField(data.add_or_remove,
                                         data.line_index,
                                         data.card_id);
        }.bind(this));

        this.socket.on('update cards on rival battle', function(data) {
            this.updateSelfCardsOnField(data.add_or_remove,
                                        data.line_index,
                                        data.card_id);
        }.bind(this));

        this.socket.on('update cards on tactics', function(data) {
            this.updateRivalCardsOnTactics(data.card_id);
        }.bind(this));

        this.socket.on('set card represent color num', function(data) {
            this.setCardRepresentColorNum(data.card_id,
                                          data.card_color,
                                          data.card_number);
        }.bind(this));

        this.socket.on('get draw card', function(data) {
            this.getDrawCard(data.draw_card_id);
        }.bind(this));

        this.socket.on('update win outcome', function(data) {
            this.win_outcome_on_each_line = data.win_outcome;
        }.bind(this));

    },

    // Send Out Socket Function
    // ======================================= //
    askForCheckGameOver: function(line_index_has_lastest_card) {
        this.socket.emit('ask for check gameover', {
            line_index_has_lastest_card: line_index_has_lastest_card
        });
    },

    askForCheckRemoveEachLineCategory: function() {
        this.socket.emit('ask for check remove each line category');
    },

    askForDrawCard: function(card_type) {
        this.socket.emit('ask for draw card', {
            card_type: card_type
        });
    },

    sendOutCardsOnRivalField: function(add_or_remove, line_index, card_id) {
        this.socket.emit('update cards on rival battle', {
            add_or_remove: add_or_remove,
            line_index: line_index,
            card_id: card_id
        });
    },

    sendOutCardsOnSelfField: function(add_or_remove, line_index, card_id) {
        this.socket.emit('update cards on self battle', {
            add_or_remove: add_or_remove,
            line_index: line_index,
            card_id: card_id
        });
    },

    sendOutCardsOnSelfTactics: function(card_id) {
        this.socket.emit('update cards on tactics', {
            card_id: card_id
        });
    },

    sendOutCardRepresentColorNum: function(card_id, card_color, card_number) {
        this.socket.emit('set card represent color num', {
            card_id: card_id,
            card_color: card_color,
            card_number: card_number
        });
    },

    sendOutPickedCard: function(card_id, picking_pos, card_state) {
        picking_pos = (typeof picking_pos === "undefined") ? [0, 0] : picking_pos;
        card_state = (typeof card_state === "undefined") ? HRenderCard.LAZY_STATE : card_state;
        this.socket.emit('set picked card', {
            card_id: card_id,
            picking_pos: picking_pos,
            card_state: card_state
        });
    },

    sendOutPickedCardPos: function(picking_pos, card_state, is_rearrange) {
        picking_pos = (typeof picking_pos === "undefined") ? [0, 0] : picking_pos;
        // card_state = (typeof card_state === "undefined") ? HRenderCard.LAZY_STATE : card_state;
        // is_rearrange = (typeof is_rearrange === "undefined") ? false : is_rearrange;
        this.socket.emit('update picked card pos', {
            picking_pos: picking_pos
        });
    },

    sendOutReturnCardToDeck: function(card_id) {
        this.socket.emit('return card to deck', {
            card_id: card_id
        });
    },

    sendOutGameStateChange: function(game_state) {
        this.socket.emit('update game state change', {
            game_state: game_state
        });
    },

    // Receive Socket Function
    // ======================================= //
    updateRivalCardsOnField: function(add_or_remove, line_index, card_id) {
        line_index = BattleFieldLayer.BATTLE_LINE_TOTAL_NUM-line_index-1;

        if (card_id.indexOf('Fog') !== -1) {
            this.which_line_fog = line_index;
            this.middle_fog_tactics_card = new HRenderCard(card_id,
                                               BattleFieldLayer.MIDDLE_ENVIRONMENT_POS[line_index],
                                               BattleFieldLayer.SCALE);
            this.addChild(this.middle_fog_tactics_card);
            return;
        } else if (card_id.indexOf('Mud') !== -1) {
            this.which_line_mud = line_index;
            this.middle_mud_tactics_card = new HRenderCard(card_id,
                                               BattleFieldLayer.MIDDLE_ENVIRONMENT_POS[line_index],
                                               BattleFieldLayer.SCALE);
            this.addChild(this.middle_mud_tactics_card);
            return;
        }

        if ("add" === add_or_remove) {
            var rival_card = new HRenderCard(card_id,
                                             BattleFieldLayer.RIVAL_BATTLE_LINE_POS[line_index],
                                             BattleFieldLayer.SCALE);
            this.cards_on_rival_battle[line_index].push(rival_card);
            this.addChild(rival_card);

            BattleFieldLayer.RIVAL_BATTLE_LINE_POS[line_index][1] += BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT;
            this.rival_picked_card.state = HRenderCard.LAZY_STATE;
        } else {
            for (var index=0; index < this.cards_on_rival_battle[line_index].length; index++) {
                if (this.cards_on_rival_battle[line_index][index].card_id === card_id) {
                    var rival_card = this.cards_on_rival_battle[line_index].splice(index, 1)[0];
                    this.removeChild(rival_card, true);
                    delete rival_card;
                }
            }
            BattleFieldLayer.RIVAL_BATTLE_LINE_POS[line_index][1] -= BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT;
        }
    },

    updateSelfCardsOnField: function(add_or_remove, line_index, card_id) {
        if ("add" === add_or_remove) {
            var self_card = new HRenderCard(card_id,
                                            BattleFieldLayer.SELF_BATTLE_LINE_POS[line_index],
                                            BattleFieldLayer.SCALE);
            this.cards_on_self_battle[line_index].push(self_card);
            this.addChild(self_card);

            BattleFieldLayer.SELF_BATTLE_LINE_POS[line_index][1] -= BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT;
            this.rival_picked_card.state = HRenderCard.LAZY_STATE;
        } else {
            for (var index=0; index < this.cards_on_self_battle[line_index].length; index++) {
                if (this.cards_on_self_battle[line_index][index].card_id === card_id) {
                    var self_card = this.cards_on_self_battle[line_index].splice(index, 1)[0];
                    this.removeChild(self_card, true);
                    delete self_card;
                }
            }
            BattleFieldLayer.SELF_BATTLE_LINE_POS[line_index][1] += BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT;
        }
    },

    updateRivalCardsOnTactics: function(rival_card_on_battle) {
        var rival_card = new HRenderCard(rival_card_on_battle.card_id,
                                         BattleFieldLayer.RIVAL_TACTICS_POS,
                                         BattleFieldLayer.SCALE);
        this.rival_picked_card.state = HRenderCard.LAZY_STATE;
        BattleFieldLayer.RIVAL_TACTICS_POS[1] -= BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT;
    },

    setCardRepresentColorNum: function(card_id, card_color, card_number) {
        var card_pos;
        for (var index=0; index < this.cards_on_self_battle[index].length; index++) {
            for (var line_index=0; line_index < this.cards_on_self_battle[index].length; line_index++) {
                if ( this.cards_on_self_battle[index] === card_id ) {
                    card_pos = this.cards_on_self_battle[index].getPosition();
                }
            }
        }
        for (var index=0; index < this.cards_on_rival_battle[index].length; index++) {
            for (var line_index=0; line_index < this.cards_on_rival_battle[index].length; line_index++) {
                if ( this.cards_on_rival_battle[index] === card_id ) {
                    card_pos = this.cards_on_rival_battle[index].getPosition();
                }
            }
        }
        card_pos = [card_pos.x, card_pos.y];

        delete this.translucent_card;
        this.translucent_card = new HRenderCard(card_color + "_" + card_number,
                                                card_pos,
                                                BattleFieldLayer.SCALE);
        this.addChild(this.translucent_card);
    },

    // Mouse Event Listener
    // ======================================= //
    onMouseMoved: function(event){
        var location = event.getLocation();
        this.mouse_x = location.x;
        this.mouse_y = location.y;

        this.checkCardsInHandAnim();
        this.updatePickedCardPos();
        this.checkRenderTranslucentCard();
    },

    onMouseDown: function(event) {
        var location = event.getLocation();
        this.mouse_x = location.x;
        this.mouse_y = location.y;
        this.checkPickUpCardInHand(location.x, location.y);
        this.checkMoveCardInHand();
        this.checkConfirm(location.x, location.y);
        this.checkDrawCard();
    },

    onRightMouseDown: function(event) {
        this.checkReleasePickedCard();
    },

    // onMouseUp:function (event) {
    //     // console.log("SSSSSS");
    // },


    // Mouse Event Function
    // =============================== //

    // mouse moved event
    checkCardsInHandAnim: function() {
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE ||
            this.picking_card !== undefined) {
            return;
        }

        if (!this.is_anim_scheduled) {
            this.schedule(this.checkInHandAnim);
            this.is_anim_scheduled = true;
        }
    },

    // schedule functioon
    checkInHandAnim: function() {
        for (var index=0; index < this.cards_in_hand.length; index++) {
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

    // mouseMoved event
    updatePickedCardPos: function() {
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE) {
            return;
        }
        if (this.picking_card !== undefined && this.picking_card.state === HRenderCard.PICKED_STATE) {
            this.picking_card.setPosition(this.mouse_x,
                                          this.mouse_y+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);

            var picking_card_pos = this.picking_card.getPosition();
            this.sendOutPickedCardPos([picking_card_pos.x, picking_card_pos.y])
        }
    },

    // mouseMoved event
    checkRenderTranslucentCard: function() {
        if (!this.isCurrentStateSelf()) {
            return;
        }
        if (this.translucent_card === undefined) {
            return;
        }
        // while picked card release
        if (this.picking_card === undefined ||
            this.picking_card.state !== HRenderCard.PICKED_STATE) {
            return;
        }

        if (this.picking_card.isTacticsReArrange()) {
            if (this.isActionIfMouseTouchRange(this.actionUpdateTranslucent,
                                               [BattleFieldLayer.SELF_TACTICS_POS],
                                               BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT)) {
                return;
            }

        } else if (this.picking_card.isTacticsEnvironment()) {
            if (this.isActionIfMouseTouchRange(this.actionUpdateTranslucent,
                                               BattleFieldLayer.MIDDLE_ENVIRONMENT_POS,
                                               BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT,
                                               BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT)) {
                return;
            }
        } else {
            if (this.isActionIfMouseTouchRange(this.actionUpdateTranslucent,
                                               BattleFieldLayer.SELF_BATTLE_LINE_POS,
                                               BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT*3,
                                               BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT)) {
                return;
            }
        }

        // not touch at all
        if(this.is_translucent_draw) {
            this.removeChild(this.translucent_card, true);
            this.is_translucent_draw = false;
        }
    },

    // onMouseDown event
    checkPickUpCardInHand: function(mouse_x, mouse_y) {
        if (this.game_state !== BattleFieldLayer.SELF_SHOULD_MOVE_STATE) {
            return;
        }

        for (var index=0; index < this.cards_in_hand.length; index++) {
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

            // click card in hand
            if (this.is_anim_scheduled) {
                this.unschedule(this.checkInHandAnim);
                this.is_anim_scheduled = false;
            }

            this.picking_card = this.cards_in_hand.splice(index, 1)[0];
            this.picking_card.state = HRenderCard.PICKED_STATE;
            this.picking_card.setPosition(mouse_x,
                                          mouse_y+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);
            if ( this.picking_card.isTacticsReArrange() ) {
                this.need_instruction_place = true;
            }
            this.sendOutPickedCard(this.picking_card.card_id,
                                   [mouse_x, mouse_y+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT],
                                   this.picking_card.state);

            // pick a put back card case
            if (this.translucent_card !== undefined &&
                this.translucent_card.card_id === this.picking_card.card_id) {
                return;
            }
            // generate translucent card
            delete this.translucent_card;
            this.translucent_card = new HRenderCard(this.picking_card.card_id,
                                                    [0, 0],
                                                    BattleFieldLayer.SCALE);
            this.translucent_card.setOpacity(BattleFieldLayer.TRANSLUCENT_ALPHA);
        }
    },

    // onMouseDown event
    checkMoveCardInHand: function() {
        if (BattleFieldLayer.SELF_SHOULD_MOVE_STATE !== this.game_state ||
            undefined === this.picking_card) {
            return;
        }

        if (this.picking_card.isTacticsReArrange()) {
            this.isActionIfMouseTouchRange(this.actionPutTacticsReArrange,
                                           [BattleFieldLayer.SELF_TACTICS_POS],
                                           BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);
        } else if (this.picking_card.isTacticsEnvironment()) {
            this.isActionIfMouseTouchRange(this.actionPutTacticsEnvironment,
                                           BattleFieldLayer.MIDDLE_ENVIRONMENT_POS,
                                           BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT);
        // soldier and tactics can replace soldier cards case
        } else {
            this.isActionIfMouseTouchRange(this.actionPutSoliderTactics,
                                           BattleFieldLayer.SELF_BATTLE_LINE_POS,
                                           BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT*3);
        }
    },

    putDownPickingCardToOnePlace: function(place_to_put, is_on_battle, battle_line_index) {
        if (undefined === this.picking_card) {
            return;
        }
        is_on_battle = (typeof is_on_battle === "undefined") ? false : is_on_battle;
        battle_line_index = (typeof battle_line_index === "undefined") ? 0 : battle_line_index;

        this.picking_card.setPosition(place_to_put[0], place_to_put[1]);
        this.picking_card.state = HRenderCard.LAZY_STATE;

        if (is_on_battle) {
            this.cards_on_self_battle[battle_line_index].push(this.picking_card);
            this.sendOutCardsOnSelfField("add", battle_line_index, this.picking_card.card_id);
            BattleFieldLayer.SELF_BATTLE_LINE_POS[battle_line_index] = [
                place_to_put[0], place_to_put[1]-BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT ];

            if (this.picking_card.isTacticsRepresent()) {
                // latest_tactics_card for select represent such as number or color
                // works, change latest_tactics_card, this.cards_on_self_battle change, too
                var self_line_cards = this.cards_on_self_battle[battle_line_index];
                this.latest_tactics_card = self_line_cards[self_line_cards.length-1];
                // TacticsRepresent only, save line_dex information, for func isGameOver
                this.latest_tactics_card.line_index = battle_line_index;
            }
        } else {
            if (this.picking_card.isTacticsReArrange()) {
                this.latest_tactics_card = this.picking_card;
                this.cards_self_tactics.push(this.picking_card);
                BattleFieldLayer.SELF_TACTICS_POS = [
                    place_to_put[0], place_to_put[1]+BattleFieldLayer.ONE_FOURTH_CARD_HEIGHT];
                this.sendOutCardsOnSelfTactics(this.picking_card.card_id);
            } else {
                if (this.picking_card.card_id.indexOf('Fog') !== -1) {
                    this.middle_fog_tactics_card = this.picking_card;
                    this.sendOutCardsOnSelfField("add", this.which_line_fog, this.picking_card.card_id);
                } else if (this.picking_card.card_id.indexOf('Mud') !== -1) {
                    this.middle_mud_tactics_card = this.picking_card;
                    this.sendOutCardsOnSelfField("add", this.which_line_mud, this.picking_card.card_id)
                }
            }
        }

        this.sendOutPickedCard(this.picking_card.card_id);
        delete this.picking_card;
        this.need_instruction_place = false;
        delete this.translucent_card;
    },

    // onMouseDown event
    checkDrawCard: function(mouse_x, mouse_y) {
        // consider special case for scout tactics
        if( (this.game_state === BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE &&
             this.scout_draw_card_count != 0) ||
             this.game_state === BattleFieldLayer.SELF_MOVE_DONE_STATE) {
            if (this.isMouseInRange(BattleFieldLayer.SOLDIER_BACK_POS)) {
                this.askForDrawCard('soldier');
            } else if (this.isMouseInRange(BattleFieldLayer.TACTICS_BACK_POS)) {
                this.askForDrawCard('tactics');
            }
        }
    },

    // onRightMouseDown event
    checkReleasePickedCard: function() {
        if (undefined !== this.picking_card) {
            this.picking_card.state = HRenderCard.RELEASING_STATE;
            this.need_instruction_place = false;
            this.is_release_scheduled = true;

            if(this.is_translucent_draw) {
                this.removeChild(this.translucent_card, true);
                this.is_translucent_draw = false;
            }

            this.schedule(this.updateReleasingCardPos);
        }
    },

    // schedule functioon
    updateReleasingCardPos: function() {
        if ( undefined === this.picking_card ||
             HRenderCard.RELEASING_STATE !== this.picking_card.state ) {
            return;
        }

        var picking_card_pos = this.picking_card.getPosition();
        picking_card_pos = [picking_card_pos.x, picking_card_pos.y];
        // put back picking card
        if (this.distanceBetweenPos(picking_card_pos, this.picking_card.initial_pos) < 5) {
            this.picking_card.setPosition(this.picking_card.initial_pos[0],
                                          this.picking_card.initial_pos[1]);
            this.picking_card.state = HRenderCard.LAZY_STATE;

            // cards in hand cases (according to y pos)
            if (this.picking_card.initial_pos[1] ===
                BattleFieldLayer.SELF_IN_HAND_POS[1][1]) {
                this.cards_in_hand.push(this.picking_card);
            // special scout case: return card to draw card pos
            } else if ( this.picking_card.initial_pos[1] === BattleFieldLayer.SOLDIER_BACK_POS[1] ||
                        this.picking_card.initial_pos[1] === BattleFieldLayer.TACTICS_BACK_POS[1] ) {
                if ( this.scout_return_card_count !== 0 ) {
                    return;
                }
                if (this.isCurrentStateSelf()) {
                    this.resetCardsInHandPos();
                    this.game_state = BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE;
                    this.sendOutGameStateChange(BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE);
                }
            // rearrange tactics card cases: back to battle
            } else {
                var battle_line_pos, cards_on_battle_line, sendOutCardsOnBattle;
                if (this.picking_card.initial_pos[1] < BattleFieldLayer.HEIGHT/2) {
                    battle_line_pos = BattleFieldLayer.RIVAL_BATTLE_LINE_POS;
                    cards_on_battle_line = this.cards_on_rival_battle;
                    sendOutCardsOnBattle = this.sendOutCardsOnRivalField;
                // this.picking_card.initial_pos[1] > BattleFieldLayer.HEIGHT/2:
                } else {
                    battle_line_pos = BattleFieldLayer.SELF_BATTLE_LINE_POS;
                    cards_on_battle_line = this.cards_on_self_battle;
                    sendOutCardsOnBattle = this.sendOutCardsOnSelfField;
                }

                for (var index=0; index < battle_line_pos.length; index++) {
                    // same pos x means in same line
                    if (this.picking_card.initial_pos[0] !== battle_line_pos[index][0]) {
                        continue;
                    }
                    cards_on_battle_line[index].push(this.picking_card);
                    sendOutCardsOnBattle("add", index, this.picking_card.card_id);
                    // need sort
                    // cards_on_battle_line[index].sort(key=lambda card:card.pos)
                }
            }

            // reset picked card for rival (default LAZY state)
            this.sendOutPickedCard(this.picking_card.card_id);
            delete this.picking_card;
            if (this.is_release_scheduled) {
                this.unschedule(this.updateReleasingCardPos);
                this.is_release_scheduled = false;
            }

        // releasing card moving
        } else {
            var curr_pos = this.picking_card.getPosition();
            var goal_vec = [this.picking_card.initial_pos[0] - curr_pos.x,
                            this.picking_card.initial_pos[1] - curr_pos.y];
            var goal_vec_length = Math.sqrt(goal_vec[0]*goal_vec[0] + goal_vec[1]*goal_vec[1]);
            goal_vec = [ goal_vec[0]/goal_vec_length,
                         goal_vec[1]/goal_vec_length ];
            var picking_card_pos = [curr_pos.x + 7*goal_vec[0],
                                    curr_pos.y + 7*goal_vec[1]];
            this.picking_card.setPosition(picking_card_pos[0], picking_card_pos[1]);
            this.sendOutPickedCardPos(picking_card_pos);
        }
    },

    // pick card effect after tactics
    // for TacticsReArrange only
    checkAnimationAfterTactics: function() {
        if (BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE !== this.game_state) {
            return;
        }
        if (undefined !== this.query_text) {
            return;
        }
        if (!this.latest_tactics_card.isTacticsReArrange()) {
            return;
        }

        // consider scout special case
        if (undefined !== this.picking_card &&
            HRenderCard.RELEASING_STATE !== this.picking_card.state) {
            this.picking_card.state = HRenderCard.LAZY_STATE;
            this.sendOutPickedCardPos(HRenderCard.LAZY_STATE);
        }

        var cards_on_which_side_in_battle_line;
        // special Scout Case
        if (-1 !== this.latest_tactics_card.card_id.indexOf("Scout")) {
            if (0 !== this.scout_draw_card_count) {
                return;
            }
            if (0 == this.scout_return_card_count) {
                return;
            }
            for (var index=0; index < this.cards_in_hand.length; index++) {
                var card_pos = this.cards_in_hand[index].getPosition();
                card_pos = [card_pos.x, card_pos.y];
                if(this.isMouseInRange(card_pos)) {
                    this.picking_card = this.cards_in_hand[index];
                    this.picking_card.state = HRenderCard.SELECTING_STATE;
                }
            }
            return;
        } else if (-1 !== this.latest_tactics_card.card_id.indexOf("Deserter") ||
                   -1 !== this.latest_tactics_card.card_id.indexOf("Traitor")) {
            cards_on_which_side_in_battle_line = this.cards_on_rival_battle;
        //  tactics_name === 'Redeploy'
        } else {
            cards_on_which_side_in_battle_line = this.cards_on_self_battle;
        }

        for (var index=0; index < cards_on_which_side_in_battle_line.length; index++) {
            if (undefined !== this.win_outcome_each_line[index]) {
                continue;
            }
            for (var line_index=0; line_index < cards_on_which_side_in_battle_line[index].length; line_index++) {
                var card_pos = cards_on_which_side_in_battle_line[index][line_index].getPosition();
                card_pos = [card_pos.x, card_pos.y];
                if(this.isMouseInRange(card_pos)) {
                    this.picking_card = this.cards_in_hand[index][line_index];
                    this.picking_card.state = HRenderCard.SELECTING_STATE;
                    this.sendOutPickedCardPos(card_pos,
                                              this.picking_card.state);
                }
            }
        }
    },

    // for TacticsRepresent
    checkSelectorAfterTactics: function() {
        if(BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE !== this.game_state) {
            return;
        }
        if(!this.latest_tactics_card.isTacticsRepresent()) {
            return;
        }

        if(!this.is_color_selector) {
            this.addChild(this.color_selector_sprite);
            this.is_color_selector = true;
        }
    },

    // for TacticsReArrange now (should consider TacticsEnvironment also)
    checkQueryAfterTactics: function() {
        if(BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE !== this.game_state) {
            return;
        }
        if(!this.latest_tactics_card.isTacticsReArrange()) {
            return;
        }

        if(undefined !== this.picking_card &&
           "SELECTING" === this.picking_card.state &&
           undefined === this.query_text) {

            var tactics_name = self.latest_tactics_card.card_id.match(/_([a-z]+)/i)[1];

            if('Deserter' === tactics_name) {
                this.genNewQuery('Do you want to discard this card ?');
            } else if ('Traitor' === tactics_name) {
                this.genNewQuery('Do you want to bribe this card ?');
            } else if ('Redeploy' === tactics_name) {
                this.genNewQuery('Do you want to redeploy this card ?');
            } else if ('Scout' === tactics_name) {
                this.genNewQuery('Do you want to return this card ?');
            }
        }
    },

    // for TacticsRepresent
    checkConfirmColorSelector: function(mouse_x, mouse_y) {
        if (undefined !== this.query_text) {
            return false;
        }
        if (!this.is_color_selector) {
            return false;
        }

        var can_represent_color = this.color_selector_sprite.tryGetWhichColor(mouse_x, mouse_y);
        if ( undefined !== can_represent_color ) {
            this.genNewQuery('Are you sure to select ' + can_represent_color + ' ?');
            this.color_selector_sprite.represent_color = can_represent_color;
            return true;
        }
        return false;
    },

    // for TacticsRepresent
    checkConfirmNumberSelector: function(mouse_x, mouse_y) {
        if (undefined !== this.query_text) {
            return false;
        }
        if (!this.is_num_123_selector && !this.is_num_all_selector) {
            return false;
        }
        var can_represent_number;
        var num_selector = this.is_num_123_selector ? this.num_123_selector_sprite : this.num_all_selector_sprite;

        if (this.is_num_123_selector) {
            can_represent_number = num_selector.tryGetWhichNum123(mouse_x, mouse_y);
        } else if (this.is_num_all_selector) {
            can_represent_number = num_selector.tryGetWhichNumAll(mouse_x, mouse_y);
        }

        if ( undefined !== can_represent_number) {
            this.genNewQuery('Are you sure to select ' + can_represent_number + ' ?');
            num_selector.represent_number = can_represent_number;
            return true;
        }
        return false;
    },

    // for TacticsRepresent (yes/no)
    checkConfirmRepresentQuery: function(tactics_name, mouse_x, mouse_y) {
        if (undefined === this.query_text) {
            return;
        }
        var yes_no = this.yes_no_selector_sprite.tryGetYesNo(mouse_x, mouse_y);
        if (undefined === yes_no) {
            return;
        }
        this.removeChild(this.query_text);
        delete this.query_text;
        this.removeChild(this.yes_no_selector_sprite);

        console.log("delete query");
        console.log(this.query_text);
        if ("No" === yes_no) {
            return;
        }

        // finished select color then select number
        //if (this.is_color_selector && !this.is_num_selector)
        if (this.is_color_selector) {
            this.latest_tactics_card.color = this.color_selector_sprite.represent_color;

            this.removeChild(this.color_selector_sprite);
            this.is_color_selector = false;

            if ('123' === tactics_name) {
                this.addChild(this.num_123_selector_sprite);
                this.is_num_123_selector = true;
            } else if ('King' === tactics_name || 'Queen' === tactics_name) {
                this.addChild(this.num_all_selector_sprite);
                this.is_num_all_selector = true;
            } else if ('super8' === tactics_name) {
                this.latest_tactics_card.number = "8";
                this.sendOutCardRepresentColorNum(this.latest_tactics_card.card_id,
                                                  this.latest_tactics_card.color,
                                                  this.latest_tactics_card.number);
                this.game_state = BattleFieldLayer.SELF_MOVE_DONE_STATE;
                //this.askForCheckGameOver(this.latest_tactics_card.line_index);
                //return;
            }
        } else if (this.is_num_123_selector || this.is_num_all_selector ) {
            if (this.is_num_123_selector) {
                this.latest_tactics_card.number = this.num_123_selector_sprite.represent_number;
                this.removeChild(this.num_123_selector_sprite);
                this.is_num_123_selector = false;
            } else if (this.is_num_all_selector) {
                this.latest_tactics_card.number = this.num_all_selector_sprite.represent_number;
                this.removeChild(this.num_all_selector_sprite);
                this.is_num_all_selector = false;
            }

            this.sendOutCardRepresentColorNum(this.latest_tactics_card.card_id,
                                              this.latest_tactics_card.color,
                                              this.latest_tactics_card.number)
            this.game_state = BattleFieldLayer.SELF_MOVE_DONE_STATE;
            //this.askForCheckGameOver(this.latest_tactics_card.line_index);
        }

    },

    // for TacticsRearrange (yes/no)
    checkConfirmRearrangeQuery: function(tactics_name, mouse_x, mouse_y) {
        var yes_no = this.yes_no_selector_sprite.tryGetYesNo(mouse_x, mouse_y);
        if (undefined === yes_no) {
            return;
        }
        this.removeChild(this.query_text);
        delete this.query_text;
        this.removeChild(this.yes_no_selector_sprite);
        if ("No" === yes_no) {
            return;
        }

        // special Scout Case
        if('Scout' === tactics_name) {
            // initial pos aleady assigned
            this.picking_card.state = "RELEASING";
            for (var index=0; index < this.cards_in_hand.length; index++) {
                if(this.cards_in_hand[index].card_id === this.picking_card.card_id) {
                    this.cards_in_hand.splice(index, 1);
                }
            }
            this.sendOutReturnCardToDeck(this.picking_card.card_id);

            // this.picking_card = undefined;
            this.scout_return_card_count -= 1;
            return;
        }
        var which_side_battle_cards, sendOutCardsOnBattle;
        if ('Deserter' === tactics_name || 'Traitor' === tactics_name) {
            which_side_battle_cards = this.cards_on_rival_battle;
            sendOutCardsOnBattle = this.sendOutCardsOnRivalField;
        } else if ('Redeploy' === tactics_name) {
            which_side_battle_cards = this.cards_on_self_battle;
            sendOutCardsOnBattle = this.sendOutCardsOnSelfField;
        }


        for (var line_index=0; line_index < which_side_battle_cards.length; line_index++) {
            for (var index=0; index < which_side_battle_cards[line_index].length; index++) {
                if(which_side_battle_cards[line_index][index].card_id !== this.picking_card.card_id) {
                    continue;
                }

                if ('Redeploy' === tactics_name || 'Traitor' === tactics_name) {
                    var curr_pos = this.picking_card.getPosition();
                    curr_pos = [curr_pos.x, curr_pos.y];
                    this.picking_card.initial_pos = curr_pos;
                    this.picking_card.state = "PICKED";

                    delete this.translucent_card;
                    this.translucent_card = new HRenderCard(this.picking_card.card_id,
                                                            [0, 0],
                                                            BattleFieldLayer.SCALE);
                    this.translucent_card.setOpacity(BattleFieldLayer.TRANSLUCENT_ALPHA);

                    this.sendOutPickedCard(this.picking_card.card_id,
                                           curr_pos,
                                           this.picking_card.state);
                }

                which_side_battle_cards[line_index].splice(index, 1);
                sendOutCardsOnBattle("remove", line_index, this.picking_card.card_id)

                if ('Deserter' === tactics_name) {
                    delete this.picking_card;
                    //this.sendOutPickedCard(BattleFieldLayer.SOLDIER_BACK.card_id);
                    this.game_state = BattleFieldLayer.SELF_MOVE_DONE_STATE;
                    this.askForCheckGameOver(line_index);
                // 'Traitor' or 'Redeploy'
                } else {
                    this.game_state = BattleFieldLayer.SELF_SHOULD_MOVE_STATE;
                }
                return;
            }
        }
    },

    checkConfirm: function(mouse_x, mouse_y) {
        if (BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE !== this.game_state) {
            return;
        }
        var tactics_name = self.latest_tactics_card.card_id.match(/_([a-z]+)/i)[1];
        // for TacticsRepresent, here condition for overlap..
        if (this.latest_tactics_card.isTacticsRepresent()) {
            if (!this.checkConfirmColorSelector(mouse_x, mouse_y)) {
                if (!this.checkConfirmNumberSelector(mouse_x, mouse_y)) {
                    this.checkConfirmRepresentQuery(tactics_name, mouse_x, mouse_y);
                }
            }
            return;
        }
        //TODO: TacticsEnvironment
        // for TacticsRearrange
        if (!this.latest_tactics_card.isTacticsReArrange()) {
            return;
        }
        if (undefined === this.query_text || undefined === this.picking_card) {
            return;
        }

        this.checkConfirmRearrangeQuery(tactics_name, mouse_x, mouse_y);
    },

    //  Func send out game_state change
    getDrawCard: function(draw_card_id) {
        var draw_card = new HRenderCard(draw_card_id,
                                        [0, 0],
                                        BattleFieldLayer.SCALE);
        this.cards_in_hand.push(draw_card);
        if (BattleFieldLayer.SELF_MOVE_DONE_STATE === this.game_state) {
            this.resetCardsInHandPos();
            this.game_state = BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE;
            this.sendOutGameStateChange(BattleFieldLayer.RIVAL_SHOULD_MOVE_STATE);
        // case for scout tactics
        } else if (BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE === this.game_state &&
                   this.scout_draw_card_count != 0) {

            for (var index=0; index < this.cards_in_hand.length; index++) {
                this.cards_in_hand[index].setPosition(BattleFieldLayer.SELF_IN_HAND_POS[index][0],
                                                      BattleFieldLayer.SELF_IN_HAND_POS[index][1])
                if (this.cards_in_hand[index].isTactics()) {
                    this.cards_in_hand[index].initial_pos = BattleFieldLayer.TACTICS_BACK_POS;
                } else {
                    this.cards_in_hand[index].initial_pos = BattleFieldLayer.SOLDIER_BACK_POS;
                }
            }
            this.scout_draw_card_count -= 1;
            this.game_state = BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE;
        }
        this.addChild(draw_card);
    },

    // execute action(function) if mouse touch a range of a range array
    isActionIfMouseTouchRange: function(action, range_array, lower_bound, upper_bound) {
        lower_bound = (typeof lower_bound === "undefined") ? 0 : lower_bound;
        upper_bound = (typeof upper_bound === "undefined") ? 0 : upper_bound;

        for (var index = range_array.length-1; index >= 0; index--) {
            if (this.isMouseInRange(range_array[index],
                                    lower_bound,
                                    upper_bound)) {
                action(index, range_array[index][0], range_array[index][1]);
                return true;
            }
        }
        return false;
    },

    // Action If Mouse Touch Range Function
    // =============================== //
    actionUpdateTranslucent: function(index, touch_range_x, touch_range_y) {
        self.translucent_card.setPosition(touch_range_x, touch_range_y);
        if (!self.is_translucent_draw) {
            self.addChild(self.translucent_card, 0);
            self.is_translucent_draw = true;
        }
    },

    actionPutTacticsReArrange: function(index, touch_range_x, touch_range_y) {
        // assign latest_tactics_card before change game_state to
        // BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE
        var tactics_name = self.picking_card.card_id.match(/_([a-z]+)/i)[1];
        self.putDownPickingCardToOnePlace([touch_range_x, touch_range_y]);
        self.tactics_self_num_on_battle += 1;
        self.game_state = BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE;

        if ('Scout' !== tactics_name) {
            return;
        }
        // Scout case
        // shift card pos and has 3 empty pos to draw card
        self.resetCardsInHandPos(0);

        // for trigger draw card special case
        self.scout_draw_card_count = 3;
        self.scout_return_card_count = 2;
    },

    actionPutTacticsEnvironment: function(index, touch_range_x, touch_range_y) {
        if (self.picking_card.card_id.indexOf('Fog') !== -1) {
            self.which_line_fog = index;
        } else {
            self.which_line_mud = index;
        }

        // sendout line_index and card id in putDownPickingCardToOnePlace, so after get line_index
        self.putDownPickingCardToOnePlace([touch_range_x, touch_range_y]);
        self.tactics_self_num_on_battle += 1

        self.game_state = BattleFieldLayer.SELF_MOVE_DONE_STATE;
        // Environment tactics need to remove original card category
        // self.askForCheckRemoveEachLineCategory();
    },

    actionPutSoliderTactics: function(index, touch_range_x, touch_range_y) {
        if (self.which_line_mud === index &&
            self.cards_on_self_battle[index].length >= BattleFieldLayer.MINIMUM_CARDS_NUM_FOR_CATEGARY+1) {
            return;
        }
        if (self.which_line_mud !== index &&
            self.cards_on_self_battle[index].length >= BattleFieldLayer.MINIMUM_CARDS_NUM_FOR_CATEGARY) {
            // render invalid(stop) sign
            return;
        }

        if (self.picking_card.isTacticsRepresent()) {
            // if wildcard_used, can not pick
            if (self.picking_card.isTacticsWildCard() && !self.wildcard_used) {
                self.wildcard_used = true;
            }
            self.tactics_self_num_on_battle += 1;
            // sendout represent color and number in checkConfirmQueryTextBox
            self.putDownPickingCardToOnePlace([touch_range_x, touch_range_y],
                                              true, index)
            self.game_state = BattleFieldLayer.SELF_MOVE_AFTER_TACTICS_STATE;
            self.checkSelectorAfterTactics();

        // should only soldier cards case
        } else {
            self.putDownPickingCardToOnePlace([touch_range_x, touch_range_y],
                                              true, index)
            self.game_state = BattleFieldLayer.SELF_MOVE_DONE_STATE;

            // send check gameover
            // self.askForCheckGameOver(index);
        }
    },

    // Util Function
    // ======================================= //
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

    distanceBetweenPos: function(pos_1, pos_2) {
        var dx2 = pos_1[0]-pos_2[0];
        var dy2 = pos_1[1]-pos_2[1];
        dx2 = dx2*dx2;
        dy2 = dy2*dy2;
        return Math.sqrt(dx2+dy2);
    },

    resetCardsInHandPos: function(offset) {
        offset = (typeof offset === "undefined") ? 1 : offset;

        this.cards_in_hand.sort(HRenderCard.sortCard);
        for (var index=0; index < this.cards_in_hand.length; index++) {
            var reset_pos = BattleFieldLayer.SELF_IN_HAND_POS[index+offset];
            this.cards_in_hand[index].setPosition(reset_pos[0], reset_pos[1]);
            this.cards_in_hand[index].initial_pos = [reset_pos[0], reset_pos[1]];
            this.cards_in_hand[index].state = HRenderCard.LAZY_STATE;
        }
    },

    countSelfTacticsNumOnBattle: function() {
        var count = 0
        for (var line_index=0; line_index<this.cards_on_self_battle.length; line_index++) {
            for (var card_index=0; card_index<this.cards_on_self_battle[line_index].length; card_index++) {
                if (this.cards_on_self_battle[line_index][card_index].isTactics()) {
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
        for (var line_index=0; line_index<this.cards_on_rival_battle.length; line_index++) {
            for (var card_index=0; card_index<this.cards_on_rival_battle[line_index].length; card_index++) {
                if (this.cards_on_rival_battle[line_index][card_index].isTactics()) {
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

    genNewQuery: function(query_text, pos, size) {
        pos = (typeof pos === "undefined") ?
            [BattleFieldLayer.WIDTH/2, BattleFieldLayer.HEIGHT/2+172] : pos;
        size = (typeof size === "undefined") ? 30 : size;
        delete this.query_text;
        this.query_text = cc.LabelTTF.create(query_text, "Monaco", size);
        this.query_text.setPosition(pos[0], pos[1]);
        this.addChild(this.query_text);
        this.addChild(this.yes_no_selector_sprite);
    }

});


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
