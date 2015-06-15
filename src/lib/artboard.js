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
        referenceLib = require("./reference");

    var assert = require("../util").assert;
        
    /**
     * Creates a new artboard at the given location
     *
     * @param {ActionDescriptor} layerRef Reference object to layers that will be added to artboard
     * @param {bottom: <number>, top: <number>, left: <number>, right: <number>} boundingBox
     * @return {PlayObject}
     */
    var makeArtboard = function (layerRef, boundingBox) {
        if (boundingBox === undefined) {
            boundingBox = layerRef;
            layerRef = referenceLib.wrapper("layer").target;
        }
        
        return new PlayObject(
            "make",
            {
                "null": {
                    "_ref": "layerSection"
                },
                "from": layerRef,
                "artboardRect": {
                    "_obj": "classFloatRect",
                    "_value": boundingBox
                }
            }
        );
    };

    /**
     * Moves/resized the referenced artboard layer to a new bounding box
     *
     * @param {ActionDescriptor} ref - Artboard layer reference
     * @param {bottom: <number>, top: <number>, left: <number>, right: <number>} boundingBox
     * @return {PlayObject}
     */
    var transformArtboard = function (ref, boundingBox) {
        assert(referenceLib.refersTo(ref) === "layer", "transformArtboard requires a layer reference");
        return new PlayObject(
            "editArtboardEvent",
            {
                "null": ref,
                "artboard": {
                    "_obj": "artboard",
                    "_value": {
                        "artboardCanvasResize": {
                            "_enum": "artboardCanvasResize",
                            "_value": "artboardCanvasResizeExpand"
                        },
                        "artboardEnabled": true,
                        "artboardRect": {
                            "_obj": "classFloatRect",
                            "_value": boundingBox
                        }
                    }
                }
            }
        );
    };

    exports.make = makeArtboard;
    exports.transform = transformArtboard;
});
