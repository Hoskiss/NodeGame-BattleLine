
var HColorSelector = cc.Sprite.extend({

    ctor: function(src_file, pos, scale) {
        this._super();

        this.initWithFile(src_file);
        this.setPosition(pos[0], pos[1]);
        this.setScale(scale);
    },

    isDotInRange: function(mouse_pos, left_top, right_buttom) {
        if ( mouse_pos[0]>left_top[0] && mouse_pos[0]<right_buttom[0] &&
             mouse_pos[1]>right_buttom[1] && mouse_pos[1]<left_top[1] ) {
            return true;
        }
        return false;
    },

    tryGetWhichColor: function(mouse_x, mouse_y) {
        var curr_pos = this.getPosition();
        if (this.isDotInRange([mouse_x, mouse_y],
                              [curr_pos.x-165, curr_pos.y+70],
                              [curr_pos.x-56, curr_pos.y-27])) {
            return "Purple";
        } else if (this.isDotInRange([mouse_x, mouse_y],
                                     [curr_pos.x-56, curr_pos.y+70],
                                     [curr_pos.x+58, curr_pos.y-27])) {
            return "Blue";
        } else if (this.isDotInRange([mouse_x, mouse_y],
                                     [curr_pos.x+58, curr_pos.y+70],
                                     [curr_pos.x+167, curr_pos.y-27])) {
            return "Yellow";
        } else if (this.isDotInRange([mouse_x, mouse_y],
                                     [curr_pos.x-165, curr_pos.y-27],
                                     [curr_pos.x-56, curr_pos.y-127])) {
            return "Red";
        } else if (this.isDotInRange([mouse_x, mouse_y],
                                     [curr_pos.x-56, curr_pos.y-27],
                                     [curr_pos.x+58, curr_pos.y-127])) {
            return "Orange";
        } else if (this.isDotInRange([mouse_x, mouse_y],
                                     [curr_pos.x+58, curr_pos.y-27],
                                     [curr_pos.x+167, curr_pos.y-127])) {
            return "Green";
        } else {
            return undefined;
        }
    }

});


// HColorSelector.prototype.tryGetWhichColor = function(mouse_y, mouse_y) {
//     var curr_location = this.getPosition();
//     //curr_location = [curr_location.x, curr_location.y];

//     draw.drawDot( cc.p(curr_location.x, curr_location.y),
//                       10, cc.c4f(0, 0, 1, 1) )
// };


