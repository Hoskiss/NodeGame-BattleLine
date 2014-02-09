
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

CardCategory.prototype = {
    CARD_CATEGORY_MAP: {
        "STRAIGHT_FLUSH_CATEGORY": 5,
        "THREE_OF_A_KIND_CATEGORY": 4,
        "FLUSH_CATEGORY": 3,
        "STRAIGHT_CATEGORY": 2,
        "ANY_OTHER_CATEGORY": 1
    },

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


// var HCardsManager = function() {
//   // always initialize all instance properties
//   this.bar = bar;
//   this.baz = 'baz'; // default value
// }

// // class methods
// Foo.prototype.fooBar = function() {

// };

// export the class
// module.exports = HCardsManager;

//test
module.exports.Card = Card;
module.exports.CardCategory = CardCategory;

