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

"use strict";

var PlayObject = require("../playobject");

/**
 * Sets the current tool to given tool
 *
 * @param {string} tool
 * @return {PlayObject}
 */
var setTool = function (tool) {
    return new PlayObject(
        "select",
        {
            "null": {
                "ref": tool
            }
        }
    );
};

/**
 * Sets the tool options. Preconditions: tool is currently selected.
 * 
 * @param {string} tool
 * @param {Object} options
 *
 * @return {PlayObject}
 */
var setToolOptions = function (tool, options) {
    return new PlayObject(
        "set",
        {
            "null": {
                ref: tool
            },
            "to": {
                obj: "currentToolOptions",
                value: options
            }
        }
    );
};

/**
 * Sets the global preference of whether vector tools modify layer selection or not
 * This translates to the Select: [Active Layers vs All Layers] option in the toolbar.
 * 
 * @param {boolean} allLayers If true, will set the Select mode to All Layers, false for Active Layers
 * 
 * @return {PlayObject}
 */
var setDirectSelectOptionForAllLayers = function (allLayers) {
    return new PlayObject(
        "set",
        {
            "null": {
                ref: [
                    {
                        "property": "generalPreferences",
                        "ref": "property"
                    },
                    {
                        "enum": "ordinal",
                        "ref": "application",
                        "value": "targetEnum"
                    }
                ]
            },
            "to": {
                obj: "generalPreferences",
                value: {
                    "legacyPathDrag": true,
                    "vectorSelectionModifiesLayerSelection": allLayers
                }
            }
        }
    );
};


/**
 * Resets the mode of shape tools back to "shape" from "path" or "pixel".
 * 
 * @return {PlayObject}
 */
var resetShapeTool = function () {
    return new PlayObject(
        "reset",
        {
            null: {
                ref: [
                    {
                        ref: null,
                        property: "vectorToolMode"
                    },
                    {
                        ref: "application",
                        enum: "ordinal",
                        value: "targetEnum"
                    }
                ]
            }
        }
    );
};

exports.setTool = setTool;
exports.setToolOptions = setToolOptions;
exports.setDirectSelectOptionForAllLayers = setDirectSelectOptionForAllLayers;
exports.resetShapeTool = resetShapeTool;
