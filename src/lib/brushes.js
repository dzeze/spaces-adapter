/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

define(function (require, exports) {
    "use strict";
    
    var PlayObject = require("../playObject"),
        referenceBy = require("./reference").wrapper("brushes"),
        inUnits = require("./unit");
    
    /**
     * Sets the current brush tip to given parameters
     *
     * @param {number} diameter
     * @param {number} hardness
     * @param {number} angle
     * @param {number} roundness
     * @param {number} spacing
     *
     * @returns {PlayObject}
     */
    var setBrushTip = function (diameter, hardness, angle, roundness, spacing) {
        return new PlayObject(
            "set",
            {
                "null": referenceBy.current,
                "to": {
                    "_obj": "computedBrush",
                    "_value": {
                        "diameter": inUnits.pixels(diameter),
                        "hardness": inUnits.percent(hardness || 100),
                        "angle": inUnits.angle(angle || 0),
                        "roundness": inUnits.percent(roundness || 100),
                        "spacing": inUnits.percent(spacing || 1)
                    }
                }
            }
        );
    };

    exports.setBrushTip = setBrushTip;
});
