
var HRenderCard = cc.Sprite.extend({

    ctor: function(card_id, card_pos, scale, rotate, card_state) {
        this._super();
        this.init(card_id, card_pos, scale, rotate, card_state);
    },

    init: function(card_id, card_pos, scale, rotate, card_state) {
        this.WIDTH = 84;
        this.HIGHT = 116;
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
    },

    isOnCard: function(x, y) {
        var curr_pos = this.getPosition();
        // console.log(curr_pos);
        if (x > curr_pos.x-this.WIDTH/2 && x < curr_pos.x+this.WIDTH/2 &&
            y > curr_pos.y-this.HIGHT/2 && y < curr_pos.y+this.HIGHT/2) {
            return true;
        }
        return false
    },

    onMouseAnimation: function(mouse_x, mouse_y, up_bound, low_bound, offset) {
        var curr_pos = this.getPosition();

        if (this.isOnCard(mouse_x, mouse_y) && curr_pos.y < up_bound) {
            this.setPosition(curr_pos.x, curr_pos.y+offset);
        }

        if (!this.isOnCard(mouse_x, mouse_y) && curr_pos.y > low_bound) {
            this.setPosition(curr_pos.x, curr_pos.y-offset);
        }
        //console.log(this.getPosition());

        // else
        //     cc.registerTargettedDelegate(1,true,this);
        // this._super();
    }

});
