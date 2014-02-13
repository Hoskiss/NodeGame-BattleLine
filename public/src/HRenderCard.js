
var HRenderCard = cc.Sprite.extend({

    ctor: function(card_id, card_pos, scale, rotate, card_state) {
        this._super();
        this.init(card_id, card_pos, scale, rotate, card_state);
    },

    init: function(card_id, card_pos, scale, rotate, card_state) {
        this.card_id = card_id;
        this.initWithSpriteFrameName(this.card_id);

        this.initial_pos = (typeof card_pos === "undefined") ?
                           [0, 0] : card_pos;
        this.setPosition(this.initial_pos[0],
                         this.initial_pos[1]);

        this.scale = (typeof scale === "undefined") ?
                     1 : scale;
        this.setScale(this.scale);

        //this.setAnchorPoint(0.5, 0.5);
        if (rotate === true) {
            this.setRotation(180);
        }

        this.state = (typeof card_state === "undefined") ?
                     "LAZY" : card_state;
    }

});
