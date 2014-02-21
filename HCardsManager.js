
var Card = function(card_id) {
    this.card_id = card_id;

    this.init = function() {
        if(this.isSoldierCard(this.card_id)) {
            this.color = this.card_id.match(/^[a-z]+/i)[0];

            this.number = this.card_id.match(/[0-9]+/i)[0];
            console.log(this.number);
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
  // always initialize all instance properties
  this.bar = bar;
  this.baz = 'baz'; // default value
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

// // class methods
// Foo.prototype.fooBar = function() {

// };

// export the class
// module.exports = HCardsManager;

//test
module.exports.Card = Card;
module.exports.CardCategory = CardCategory;
module.exports.HCardsManager = HCardsManager;
