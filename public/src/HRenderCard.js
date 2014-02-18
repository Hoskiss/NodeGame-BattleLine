
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
    },

    isTactics: function() {
        // if (this.card_id.match(/^[a-z]+/i)[0] === 'Tactics') {
        if (this.card_id.indexOf("Tactics") !== -1) {
            return true;
        }
        return false;
    },

    isTacticsWildCard: function() {
        if (this.card_id.indexOf("King") !== -1 || this.card_id.indexOf("Queen") !== -1) {
            return true;
        }
        return false;
    },

    isTacticsRepresent: function() {
        if (!this.isTactics()) {
            return false;
        }
        if ( this.card_id.indexOf('super8') !== -1 ||
             this.card_id.indexOf('123') !== -1 ||
             this.card_id.indexOf('King') !== -1 ||
             this.card_id.indexOf('Queen') !== -1 ) {
            return true;
        }
        return false;
    },

    isTacticsReArrange: function() {
        if (!this.isTactics()) {
            return false;
        }
        if ( this.card_id.indexOf('Deserter') !== -1 ||
             this.card_id.indexOf('Redeploy') !== -1 ||
             this.card_id.indexOf('Scout') !== -1 ||
             this.card_id.indexOf('Traitor') !== -1 ) {
            return true;
        }
        return false;
    },

    isTacticsEnvironment: function() {
        if (!this.isTactics()) {
            return false;
        }
        if ( this.card_id.indexOf('Fog') !== -1 ||
             this.card_id.indexOf('Mud') ) {
            return true;
        }
        return false;
    },

    isTouch: function(x, y) {
        var curr_pos = this.getPosition();
        // console.log(curr_pos);
        if (x > curr_pos.x-HRenderCard.WIDTH/2 && x < curr_pos.x+HRenderCard.WIDTH/2 &&
            y > curr_pos.y-HRenderCard.HIGHT/2 && y < curr_pos.y+HRenderCard.HIGHT/2) {
            return true;
        }
        return false
    },

    onMouseAnimation: function(mouse_x, mouse_y, up_bound, low_bound, offset) {


        var curr_pos = this.getPosition();

        if (this.isTouch(mouse_x, mouse_y) && curr_pos.y < up_bound) {
            this.setPosition(curr_pos.x, curr_pos.y+offset);
        }

        else if (!this.isTouch(mouse_x, mouse_y) && curr_pos.y > low_bound) {
            this.setPosition(curr_pos.x, curr_pos.y-offset);
        }
    }

});

HRenderCard.WIDTH = 84;
HRenderCard.HIGHT = 116;

