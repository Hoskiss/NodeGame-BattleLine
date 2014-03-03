
// var HQueryText = cc.Sprite.extend({

//     ctor: function(query, size, pos) {
//         this._super();

//         this.query_text = cc.LabelTTF.create(query, "Monaco", size);
//         this.query_text.setPosition(pos[0], pos[1]);
//     }
// });

var HSelector = cc.Sprite.extend({

    ctor: function(src_file, pos, scale) {
        this._super();

        this.initWithFile(src_file);
        this.setPosition(pos[0], pos[1]);
        this.setScale(scale);

        //this.tmpDrawDot();
    },

    tmpDrawDot: function() {
        var curr_location = this.getPosition();
        // draw.drawDot( cc.p(curr_location.x, curr_location.y),
        //               10, cc.c4f(0, 0, 1, 1) );
        draw.drawDot( cc.p(curr_location.x+100, curr_location.y+50),
                      10, cc.c4f(0, 0, 1, 1) );
        draw.drawDot( cc.p(curr_location.x+200, curr_location.y-30),
                      10, cc.c4f(0, 0, 1, 1) );
    },

    // isDotInRange: function(mouse_pos, left_top, right_buttom) {
    //     if ( mouse_pos[0]>left_top[0] && mouse_pos[0]<right_buttom[0] &&
    //          mouse_pos[1]>right_buttom[1] && mouse_pos[1]<left_top[1] ) {
    //         return true;
    //     }
    //     return false;
    // },

    // left_top, right_buttom (2 pos in an array)
    isDotInRange: function(mouse_pos, l_t_r_b) {
        if ( mouse_pos[0]>l_t_r_b[0] && mouse_pos[0]<l_t_r_b[2] &&
             mouse_pos[1]>l_t_r_b[3] && mouse_pos[1]<l_t_r_b[1] ) {
            return true;
        }
        return false;
    },

    tryGetWhichColor: function(mouse_x, mouse_y) {
        var curr_pos = this.getPosition();
        var color_range_map = {
            "Purple": [curr_pos.x-165, curr_pos.y+70, curr_pos.x-56, curr_pos.y-27],
            "Blue": [curr_pos.x-56, curr_pos.y+70, curr_pos.x+58, curr_pos.y-27],
            "Yellow": [curr_pos.x+58, curr_pos.y+70, curr_pos.x+167, curr_pos.y-27],
            "Red": [curr_pos.x-165, curr_pos.y-27, curr_pos.x-56, curr_pos.y-127],
            "Orange": [curr_pos.x-56, curr_pos.y-27, curr_pos.x+58, curr_pos.y-127],
            "Green": [curr_pos.x+58, curr_pos.y-27, curr_pos.x+167, curr_pos.y-127]
        }

        for (var key in color_range_map) {
            if (this.isDotInRange([mouse_x, mouse_y], color_range_map[key])) {
                return key;
            }
        }
        return undefined;
    },

    tryGetWhichNum123: function(mouse_x, mouse_y) {
        var curr_pos = this.getPosition();
        var num_range_map = {
            "1": [curr_pos.x-160, curr_pos.y+50, curr_pos.x-60, curr_pos.y-30],
            "2": [curr_pos.x-30, curr_pos.y+50, curr_pos.x+70, curr_pos.y-30],
            "3": [curr_pos.x+100, curr_pos.y+50, curr_pos.x+200, curr_pos.y-30]
        }

        for (var key in num_range_map) {
            if (this.isDotInRange([mouse_x, mouse_y], num_range_map[key])) {
                return key;
            }
        }
        return undefined;
    },

    tryGetWhichNumAll: function(mouse_x, mouse_y) {
        var curr_pos = this.getPosition();
        var num_range_map = {
            "1": [curr_pos.x-210, curr_pos.y+50, curr_pos.x-130, curr_pos.y-20],
            "2": [curr_pos.x-130, curr_pos.y+50, curr_pos.x-40, curr_pos.y-20],
            "3": [curr_pos.x-40, curr_pos.y+50, curr_pos.x+50, curr_pos.y-20],
            "4": [curr_pos.x+50, curr_pos.y+50, curr_pos.x+140, curr_pos.y-20],
            "5": [curr_pos.x+140, curr_pos.y+50, curr_pos.x+230, curr_pos.y-20],
            "6": [curr_pos.x-210, curr_pos.y-20, curr_pos.x-130, curr_pos.y-100],
            "7": [curr_pos.x-130, curr_pos.y-20, curr_pos.x-40, curr_pos.y-100],
            "8": [curr_pos.x-40, curr_pos.y-20, curr_pos.x+50, curr_pos.y-100],
            "9": [curr_pos.x+50, curr_pos.y-20, curr_pos.x+140, curr_pos.y-100],
            "10": [curr_pos.x+140, curr_pos.y-20, curr_pos.x+230, curr_pos.y-100]
        }

        for (var key in num_range_map) {
            if (this.isDotInRange([mouse_x, mouse_y], num_range_map[key])) {
                return key;
            }
        }
        return undefined;
    },

    tryGetYesNo: function(mouse_x, mouse_y) {
        var curr_pos = this.getPosition();
        var yesno_range_map = {
            "Yes": [curr_pos.x-90, curr_pos.y+30, curr_pos.x, curr_pos.y-30],
            "No": [curr_pos.x, curr_pos.y+30, curr_pos.x+90, curr_pos.y-30]
        }

        for (var key in yesno_range_map) {
            if (this.isDotInRange([mouse_x, mouse_y], yesno_range_map[key])) {
                return key;
            }
        }
        return undefined;
    },

});





// HColorSelector.prototype.tryGetWhichColor = function(mouse_y, mouse_y) {
//     var curr_location = this.getPosition();
//     //curr_location = [curr_location.x, curr_location.y];

//     draw.drawDot( cc.p(curr_location.x, curr_location.y),
//                       10, cc.c4f(0, 0, 1, 1) )
// };


