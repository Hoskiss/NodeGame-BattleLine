var winston = require('winston');
// winston.add(winston.transports.File, { filename: __dirname+'.log' });
// winston.remove(winston.transports.Console);
var knuthShuffle = require('knuth-shuffle').knuthShuffle;

var Card = function(card_id) {
    this.card_id = card_id;

    this.init = function() {
        if(this.isSoldierCard(this.card_id)) {
            this.color = this.card_id.match(/^[a-z]+/i)[0];

            this.number = this.card_id.match(/[0-9]+/i)[0];
            // console.log(this.number);
        }
        else {
            this.color = null;
            this.number = null;
        }
    };

    this.init();
}

Card.prototype = {
    isSoldierCard: function(card_id) {
        var COLOR_LIST = ['Red', 'Orange', 'Yellow',
                          'Green', 'Blue', 'Purple'];
        return (COLOR_LIST.indexOf(card_id.match(/^[a-z]+/i)[0]));
    }
}

var CardCategory = function(line_cards_info, category) {

    this.init = function() {
        this.category = (typeof category === "undefined") ?
                        "ANY_OTHER_CATEGORY" : category;
        // should be a list has at least 3 cards info
        // where card_info = (str(color), int(num))
        this.line_cards_info = line_cards_info;
        this.complete_first_or_second = 1;
    };

    this.init();
}

CardCategory.CARD_CATEGORY_MAP = {
    "STRAIGHT_FLUSH_CATEGORY": 5,
    "THREE_OF_A_KIND_CATEGORY": 4,
    "FLUSH_CATEGORY": 3,
    "STRAIGHT_CATEGORY": 2,
    "ANY_OTHER_CATEGORY": 1
};
CardCategory.prototype = {
    lessThan: function(other) {
        if (this.category !== other.category) {
            return (this.CARD_CATEGORY_MAP[this.category] <
                    this.CARD_CATEGORY_MAP[other.category]);
        }
        else {
            var self_total_num_sum = 0;
            var other_total_num_sum = 0;

            this.line_cards_info.forEach(function(each_info) {
                self_total_num_sum += each_info[1];
            });
            other.line_cards_info.forEach(function(each_info) {
                other_total_num_sum += each_info[1];
            });

            if (self_total_num_sum !== other_total_num_sum) {
                return self_total_num_sum < other_total_num_sum;
            }
            else {
                return this.complete_first_or_second > other.complete_first_or_second;
            }
        }
    }
}


var HCardsManager = function() {

    this.cards_in_hand_lower = [];
    this.cards_on_field_lower = new Array(HCardsManager.BATTLE_LINE_TOTAL_NUM);
    for (var index=0; index < this.cards_on_field_lower.length; index++) {
        this.cards_on_field_lower[index] = new Array();
    }

    this.cards_in_hand_upper = [];
    this.cards_on_field_upper = new Array(HCardsManager.BATTLE_LINE_TOTAL_NUM);
    for (var index=0; index < this.cards_on_field_upper.length; index++) {
        this.cards_on_field_upper[index] = new Array();
    }

    // tactics;
    this.lower_re_arrange_tactics = [];
    this.upper_re_arrange_tactics = [];

    this.which_line_fog = -1;
    this.which_line_mud = -1;

    this.cards_category_field_lower = new Array(HCardsManager.BATTLE_LINE_TOTAL_NUM);
    this.cards_category_field_upper = new Array(HCardsManager.BATTLE_LINE_TOTAL_NUM);

    this.win_outcome_each_line = new Array(HCardsManager.BATTLE_LINE_TOTAL_NUM);
    this.state = HCardsManager.LOWER_SHOULD_MOVE_STATE;

    this.random_soldier_index = new Array(HCardsManager.SOLDIER_CARD_LIST.length);
    for (var index=0; index < this.random_soldier_index.length; index++) {
        this.random_soldier_index[index] = index;
    }
    knuthShuffle(this.random_soldier_index);

    this.random_tacticsr_index = new Array(HCardsManager.TACTICS_CARD_LIST.length);
    for (var index=0; index < this.random_tacticsr_index.length; index++) {
        this.random_tacticsr_index[index] = index;
    }
    knuthShuffle(this.random_tacticsr_index);

}

HCardsManager.SOLDIER_CARD_LIST = [
    'Red_1', 'Red_2', 'Red_3', 'Red_4', 'Red_5',
    'Red_6', 'Red_7', 'Red_8', 'Red_9', 'Red_10',
    'Orange_1', 'Orange_2', 'Orange_3', 'Orange_4', 'Orange_5',
    'Orange_6', 'Orange_7', 'Orange_8', 'Orange_9', 'Orange_10',
    'Yellow_1', 'Yellow_2', 'Yellow_3', 'Yellow_4', 'Yellow_5',
    'Yellow_6', 'Yellow_7', 'Yellow_8', 'Yellow_9', 'Yellow_10',
    'Green_1', 'Green_2', 'Green_3', 'Green_4', 'Green_5',
    'Green_6', 'Green_7', 'Green_8', 'Green_9', 'Green_10',
    'Blue_1', 'Blue_2', 'Blue_3', 'Blue_4', 'Blue_5',
    'Blue_6', 'Blue_7', 'Blue_8', 'Blue_9', 'Blue_10',
    'Purple_1', 'Purple_2', 'Purple_3', 'Purple_4', 'Purple_5',
    'Purple_6', 'Purple_7', 'Purple_8', 'Purple_9', 'Purple_10']

HCardsManager.TACTICS_CARD_LIST = [
   'Tactics_super8', 'Tactics_123', 'Tactics_Deserter',
   'Tactics_Fog', 'Tactics_King', 'Tactics_Mud',
   'Tactics_Queen', 'Tactics_Redeploy', 'Tactics_Scout',
   'Tactics_Traitor']

HCardsManager.NUM_CARDS_IN_HAND = 7
HCardsManager.BATTLE_LINE_TOTAL_NUM = 9
HCardsManager.MINIMUM_NUM_FOR_CATEGARY = 3

HCardsManager.LOWER_SHOULD_MOVE_STATE = 'LOWER_SHOULD_MOVE_STATE';
HCardsManager.LOWER_MOVE_AFTER_TACTICS_STATE = 'LOWER_MOVE_AFTER_TACTICS_STATE';
HCardsManager.LOWER_MOVE_DONE_STATE = 'LOWER_MOVE_DONE_STATE';
HCardsManager.UPPER_SHOULD_MOVE_STATE = 'UPPER_SHOULD_MOVE_STATE';
HCardsManager.UPPER_MOVE_AFTER_TACTICS_STATE = 'UPPER_MOVE_AFTER_TACTICS_STATE';
HCardsManager.UPPER_MOVE_DONE_STATE = 'UPPER_MOVE_DONE_STATE';
HCardsManager.GAME_OVER_STATE = 'GAME_OVER_STATE';

// public methods
HCardsManager.prototype.drawCard = function(card_type, which_player) {
    if ('soldier' === card_type && 0 === this.random_soldier_index.length) {
        return undefined;
    }
    if ('tactics' ===card_type && 0 === this.random_tacticsr_index.length) {
        return undefined;
    }

    var draw_card_index = -1;
    var draw_card_id = "";

    if ('soldier' === card_type) {
        draw_card_index = this.random_soldier_index.pop();
        draw_card_id = HCardsManager.SOLDIER_CARD_LIST[draw_card_index];
    }
    else if ('tactics' === card_type) {
        draw_card_index = this.random_tacticsr_index.pop();
        draw_card_id = HCardsManager.TACTICS_CARD_LIST[draw_card_index];
    }

    if ("lower" == which_player) {
        this.cards_in_hand_lower.push(new Card(draw_card_id));
    }
    else {
        this.cards_in_hand_upper.push(new Card(draw_card_id));
    }

    return draw_card_id;
};

HCardsManager.prototype.firstDrawCardsInHand = function(which_player) {
    // first draw 7 cards in hand
    var cards_in_which_hand = undefined;

    if ('upper' === which_player) {
        cards_in_which_hand = this.cards_in_hand_upper;
    }
    else {
        cards_in_which_hand = this.cards_in_hand_lower;
    }
    // client reconnect...
    if (7 !== cards_in_which_hand.length) {
        for (var index=0; index < HCardsManager.NUM_CARDS_IN_HAND; index++) {
            this.drawCard('soldier', which_player);
        }
    }

    // return id only (save transmit data size)
    var cards_in_hand_id = [];
        for (var index=0; index < cards_in_which_hand.length; index++) {
            cards_in_hand_id.push(cards_in_which_hand[index].card_id);
    }

    winston.info("player: " + which_player);
    winston.info(cards_in_hand_id);
    return cards_in_hand_id;
};

HCardsManager.prototype.setCardsOnBattle = function(which_player, add_or_remove, line_index, card_id) {
    if ("upper" === which_player) {
        line_index = HCardsManager.BATTLE_LINE_TOTAL_NUM-line_index-1;
    }
    if ("Tactics_Fog"===card_id) {
        this.which_line_fog = line_index;
        return;
    }
    if ("Tactics_Mud"===card_id) {
        this.which_line_mud = line_index;
        return;
    }

    if ("lower"=== which_player) {
        if ("add"===add_or_remove) {
            this.cards_on_field_lower[line_index].push( new Card(card_id) );
        } else {
            for (var index=0; index < this.cards_on_field_lower[line_index].length; index++) {
                if(this.cards_on_field_lower[line_index][index].card_id === card_id) {
                    this.cards_on_field_lower[line_index].splice(index, 1);
                }
            }
        }
    } else {
        if ("add"===add_or_remove) {
            this.cards_on_field_upper[line_index].push( new Card(card_id) );
        } else {
            for (var index=0; index < this.cards_on_field_upper[line_index].length; index++) {
                if(this.cards_on_field_upper[line_index][index].card_id === card_id) {
                    this.cards_on_field_upper[line_index].splice(index, 1);
                }
            }
        }
    }
};

module.exports.Card = Card;
module.exports.CardCategory = CardCategory;
module.exports.HCardsManager = HCardsManager;
