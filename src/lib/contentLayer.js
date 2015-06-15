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
        referenceBy = require("./reference").wrapper("contentLayer"),
        unitsIn = require("./unit"),
        shape = require("./shape");

    var assert = require("../util").assert,
        referenceOf = require("./reference").refersTo;

    /**
     * Stroke alignment possible values
     */
    var alignmentTypes = Object.defineProperties({}, {
        OUTSIDE: {
            value: "strokeStyleAlignOutside",
            writeable: false,
            enumerable: true
        },
        CENTER: {
            value: "strokeStyleAlignCenter",
            writeable: false,
            enumerable: true
        },
        INSIDE: {
            value: "strokeStyleAlignInside",
            writeable: false,
            enumerable: true
        }
    });
    
    /**
     * Stroke cap possible values
     */
    var _strokeCap = {
        square: "strokeStyleSquareCap",
        round: "strokeStyleRoundCap",
        butt: "strokeStyleButtCap"
    };
    
    /**
     * Stroke Corner possible values
     */
    var _strokeCorner = {
        miter: "strokeStyleMiterJoin",
        round: "strokeStyleRoundJoin",
        bevel: "strokeStyleBevelJoin"
    };

    /**
     * Pattern Name values
     */
    var _patternName = {
        pBubbles: ["b7334da0-122f-11d4-8bb5-e27e45023b5f",
        "$$$/Presets/Patterns/Patterns_pat/Bubbles=Bubbles"],
        pTieDye: ["1b29876b-58b7-11d4-b895-a898787104c1",
        "$$$/Presets/Patterns/Patterns_pat/TieDye=Tie Dye"],
        pLaidhorizontal: ["52a93427-f5d6-1172-a989-8dc82a43aa51",
        "$$$/Presets/Patterns/Patterns_pat/Laidhorizontal=Laid-horizontal"],
        pFineGrain: ["c02fddff-f05a-1172-9a0f-f7bad69dd4b0",
        "$$$/Presets/Patterns/Patterns_pat/FineGrain=Fine Grain"],
        pGrayGranite: ["f293c3d4-57f7-1177-b70c-a0459fa92660",
        "$$$/Presets/Patterns/Patterns_pat/GrayGranite=Gray Granite"]
    };

    /**
     * Constant values for types of strokes and fills
     * @type {Object.<string, string>}
     */
    var contentTypes = Object.defineProperties({}, {
        SOLID_COLOR: {
            value: "solidColor",
            writeable: false,
            enumerable: true
        },
        GRADIENT: {
            value: "gradient",
            writeable: false,
            enumerable: true
        },
        PATTERN: {
            value: "pattern",
            writeable: false,
            enumerable: true
        }
    });

    /**
     * Shape origin types
     * 
     * @const
     * @type {Object.<string, number>}
     */
    var originTypes = Object.defineProperties({}, {
        ORIGIN_UNDEFINED: {
            value: -1,
            enumerable: true,
            writeable: false
        },
        ORIGIN_NONE: {
            value: 0,
            enumerable: true,
            writeable: false
        },
        ORIGIN_RECT: {
            value: 1,
            enumerable: true,
            writeable: false
        },
        ORIGIN_ROUNDED_RECT: {
            value: 2,
            enumerable: true,
            writeable: false
        },
        ORIGIN_POLYGON: {
            value: 3,
            enumerable: true,
            writeable: false
        },
        ORIGIN_LINE: {
            value: 4,
            enumerable: true,
            writeable: false
        },
        ORIGIN_ELLIPSE: {
            value: 5,
            enumerable: true,
            writeable: false
        },
        ORIGIN_CUSTOM: {
            value: 6,
            enumerable: true,
            writeable: false
        }
    });


    /**
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {string} alignment The stroke alignment. "outside", "center", or "inside"
     *
     * @return {PlayObject}
     */
    var setStrokeAlignment = function (sourceRef, alignment) {
        assert(referenceOf(sourceRef) === "contentLayer", "setStrokeAlignment is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "strokeEnabled": true,
                                "strokeStyleLineAlignment": {
                                    "_enum": "strokeStyleLineAlignment",
                                    "_value": alignmentTypes[alignment]
                                },
                                "strokeStyleVersion": 2
                            }
                        }
                    }
                }
            }
        );
    };



    /**
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {string} cap The stroke path cap. "square", "round", or "butt"
     *
     * @return {PlayObject}
     */
    var setStrokeCap = function (sourceRef, cap) {
        assert(referenceOf(sourceRef) === "contentLayer", "setStrokeCap is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "strokeEnabled": true,
                                "strokeStyleLineCapType": {
                                    "_enum": "strokeStyleLineCapType",
                                    "_value": _strokeCap[cap]
                                },
                                "strokeStyleVersion": 2
                            }
                        }
                    }
                }
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {string} corner The stroke corner. "miter", "round", or "bevel"
     *
     * @return {PlayObject}
     */
    var setStrokeCorner = function (sourceRef, corner) {
        assert(referenceOf(sourceRef) === "contentLayer", "setStrokeCorner is passed a non-layer reference");
        return new PlayObject (
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "strokeEnabled": true,
                                "strokeStyleLineJoinType": {
                                    "_enum": "strokeStyleLineJoinType",
                                    "_value": _strokeCorner[corner]
                                },
                                "strokeStyleVersion": 2
                            }
                        }
                    }
                }
            }
        );
    };

    /**
     * Set shape stroke opacity
     * This currently sets all selected layers
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {number} opacity opacity as a percentage [0,100]
     *
     * @return {PlayObject}
     */
    var setStrokeOpacity = function (sourceRef, opacity) {
        assert(referenceOf(sourceRef) === "contentLayer", "setStrokeOpacity is passed a non-layer reference");
        var descriptor = {
            "null": sourceRef,
            "to": {
                "_obj": "shapeStyle",
                "_value": {
                    "strokeStyle": {
                        "_obj": "strokeStyle",
                        "_value": {
                            "strokeEnabled": true,
                            "strokeStyleOpacity": unitsIn.percent(opacity),
                            "strokeStyleVersion": 2
                        }
                    }
                }
            }
        };
        return new PlayObject("set", descriptor);
    };


    /**
     * Set shape fill to solid color with RGB color
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {array | number | object } rgb The array of RGB color [red,green,blue] for shape fill color. 0 to 255
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * var myColor = [100,200,150];
     * raw.contentLayer.setShapeFillTypeSolidColor(myColor);
     *
     * raw.contentLayer.setShapeFillTypeSolidColor([100,200,150]);
     */
    var setShapeFillTypeSolidColor = function (sourceRef, rgb) {
        assert(referenceOf(sourceRef) === "contentLayer", "setShapeFillTypeSolidColor is passed a non-layer reference");
        if (rgb === null) {
            return _setShapeFillTypeNoColor(sourceRef);
        }
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "fillContents": shape.fillContentsObject("solidColorLayer", rgb),
                        "strokeStyle": shape.shapeFillObject(true)
                    }
                }
            }
        );
    };

    /**
     * Set shape stroke fill to solid color with RGB color
     * Also sets opacity if provided as an alpha property "a" of the rgba object parameter
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {{r: !number, g: !number, b: !number, a: ?number}} rgba color in standard rgba object format
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * var myColor = {r: 100, g: 250, b: 25, a: 0.6},
     *     layerRef = contentLayer.referenceBy.current;
     *     
     *     strokeObj = contentLayer.setStrokeFillTypeSolidColor(layerRef, myColor);
     */
    var setStrokeFillTypeSolidColor = function (sourceRef, rgba) {
        assert(referenceOf(sourceRef) === "contentLayer",
            "setStrokeFillTypeSolidColor is passed a non-layer reference");
        if (rgba === null) {
            return _setStrokeFillTypeNoColor(sourceRef);
        }
        var descriptor = {
            "null": sourceRef,
            "to": {
                "_obj": "shapeStyle",
                "_value": {
                    "strokeStyle": {
                        "_obj": "strokeStyle",
                        "_value": {
                            "strokeEnabled": true,
                            "strokeStyleContent": shape.fillContentsObject("solidColorLayer", rgba),
                            "strokeStyleVersion": 2
                        }
                    }
                }
            }
        };
        if (rgba.hasOwnProperty("a")) {
            descriptor.to._value.strokeStyle._value.strokeStyleOpacity = unitsIn.percent(rgba.a * 100);
        }
        return new PlayObject("set", descriptor);
    };

    /**
     * Set shape fill with no color
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.setShapeFillTypeNoColor();
     */
    var _setShapeFillTypeNoColor = function (sourceRef) {
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": shape.shapeFillObject(false)
                    }
                }
            }
        );
    };

    /**
     * Set shape stroke with no color
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.setStrokeFillTypeNoColor();
     */
    var _setStrokeFillTypeNoColor = function (sourceRef) {
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": shape.shapeStrokeObject(false)
                    }
                }
            }
        );
    };

    /**
     * Set shape stroke width
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {number} strokeWidth The width of shape stroke. For pt, 0.00 to 288.00
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.setShapeStrokeWidth(10);
     */
    var setShapeStrokeWidth = function (sourceRef, strokeWidth) {
        assert(referenceOf(sourceRef) === "contentLayer", "setShapeStrokeWidth is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "strokeEnabled": true,
                                "strokeStyleLineWidth": unitsIn.pixels(strokeWidth),
                                "strokeStyleVersion": 2
                            }
                        }
                    }
                }
            }
        );
    };

    /**
     * Set shape stroke fill with pattern
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {string} fillTypePatternName The name of the pattern. 
     *      "pBubbles", "pTieDye", "pLaidhorizontal", "pFineGrain", or "pGrayGranite"
     * @param {integer} scaleVal The scale of pattern. 0 to 1000
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.setStrokeFillTypePattern("pBubbles", 100);
     */
    var setStrokeFillTypePattern = function (sourceRef, fillTypePatternName, scaleVal) {
        assert(referenceOf(sourceRef) === "contentLayer", "setStrokeFillTypePattern is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "strokeEnabled": true,
                                "strokeStyleContent": {
                                    "_obj": "patternLayer",
                                    "_value": {
                                        "align": true,
                                        "pattern": {
                                            "_obj": "pattern",
                                            "_value": {
                                                "ID": _patternName[fillTypePatternName][0],
                                                "name": _patternName[fillTypePatternName][1]
                                            }
                                        },
                                        "phase": {
                                            "_obj": "paint",
                                            "_value": {
                                                "horizontal": 0,
                                                "vertical": 0
                                            }
                                        },
                                        "scale": unitsIn.percent(scaleVal)
                                    }
                                },
                                "strokeStyleVersion": 2
                            }
                        }
                    }
                }
            }
        );
    };

    /**
     * Set shape fill with pattern
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {string} fillTypePatternName The name of the pattern. 
     *      "pBubbles", "pTieDye", "pLaidhorizontal", "pFineGrain", or "pGrayGranite"
     * @param {integer} scaleVal The scale of pattern. 0 to 1000
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.setShapeFillTypePattern("pBubbles", 100);
     */
    var setShapeFillTypePattern = function (sourceRef, fillTypePatternName, scaleVal) {
        assert(referenceOf(sourceRef) === "contentLayer", "setShapeFillTypePattern is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "shapeStyle",
                    "_value": {
                        "fillContents": {
                            "_obj": "patternLayer",
                            "_value": {
                                "align": true,
                                "pattern": {
                                    "_obj": "pattern",
                                    "_value": {
                                        "ID": _patternName[fillTypePatternName][0],
                                        "name": _patternName[fillTypePatternName][1]
                                    }
                                },
                                "phase": {
                                    "_obj": "paint",
                                    "_value": {
                                        "horizontal": 0,
                                        "vertical": 0
                                    }
                                },
                                "scale": unitsIn.percent(scaleVal)
                            }
                        },
                        "strokeStyle": shape.shapeFillStrokeStyle(true)
                    }
                }
            }
        );
    };

    /**
     * Remove Stroke Style (AGMStrokeStyle) completely from the provided content layers
     * This has the effect of removing a shape's stroke
     * Note: this may have unexpected results on shapes without a fill
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @return {PlayObject}
     */
    var deleteShapeStyle = function (sourceRef) {
        assert(referenceOf(sourceRef) === "contentLayer", "deleteShapeStyle is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                to: {
                    "_obj": "deleteShapeStyle",
                    "_value": {}
                }
            }
        );
    };

    /**
     * Move shape
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {number} hVal The number of horizontal.
     * @param {number} vVal The number of vertical.
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Select a layer
     *
     * Examples:
     * raw.contentLayer.moveShape(20,20);
     */
    var moveShape = function (sourceRef, hVal, vVal) {
        assert(referenceOf(sourceRef) === "contentLayer", "moveShape is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": sourceRef,
                "to": {
                    "_obj": "_offset",
                    "_value": {
                        "horizontal": unitsIn.distance(hVal),
                        "vertical": unitsIn.distance(vVal)
                    }
                }
            }
        );
    };

    /**
     * Create a shape (Rectangle, Rounded Rectangle, Ellipse)
     *
     * @param {ActionDescriptor} sourceRef Reference to layer(s) to edit
     * @param {boolean} fillEnabledVal Whether the fill shape is enabled. 
     *      true for Solic Color or Pattern, false for No Color
     * @param {string} fillContentShape The type of shape content. 
     *      "solidColorLayer" for Solic Color, "patternLayer" for Pattern
     * @param {array} fillContentShapeVal The array of RGB color [red,green,blue]
     *      for shape fill color. 0 to 255
     * @param {boolean} strokeEnabledVal Whether the fill stroke is enabled.
     *      true for Solic Color or Pattern, false for No Color
     * @param {string} fillContentStroke "solidColorLayer" for Solid Color, 
     *      "patternLayer" for Pattern
     * @param {array} fillContentStrokeVal The array of RGB color [red,green,blue] 
     *      for shape stroke color. 0 to 255
     * @param {string} strokeAlignment The stroke alignment options. "outside",
     *      "inside", or "center"
     * @param {string} cap The path cap options. "square", "round", or "butt"
     * @param {string} corner The stroke corner options. "miter", "round", or "bevel"
     * @param {number} strokeWidth The width of shape stroke. For pt, 0.00 to 288.00
     * @param {string} typeShape The type of shape to create. "rectangle" for
     *      Rectangle or Rounded Rectangle, "ellipse" for Ellipse
     * @param {array} shapeVal The array of pixelsUnit values.
                      rectangle for [top,bottom,left,right,topleft,topright,bottomleft,bottomright],
     *                ellipse for [top,bottom,left,right]
     * y,x
     *
     * @return {PlayObject}
     *
     * Preconditions
     * Open or create a document.
     *
     * Examples:
     * raw.contentLayer.createShape(true,"patternLayer","pBubbles",true,"solidColorLayer",[0,100,200],
     * outside","butt","miter",10,"rectangle",[300,500,250,600,-1,-1,-1,-1]);
     *
     * raw.contentLayer.createShape(true,"solidColorLayer",[255,150,200],true,"solidColorLayer",[0,100,200],
     * outside","butt","miter",10,"rectangle",[300,500,250,600,10,10,10,10]);
     *
     * raw.contentLayer.createShape(false,"solidColorLayer",[255,150,200],true,"patternLayer","pBubbles",
     * outside","butt","miter",10,"ellipse",[250,100,400,100]);
     */
    var createShape = function (sourceRef, fillEnabledVal, fillContentShape, fillContentShapeVal,
            strokeEnabledVal, fillContentStroke, fillContentStrokeVal, strokeAlignment,
            cap, corner, strokeWidth, typeShape, shapeVal) {
        assert(referenceOf(sourceRef) === "contentLayer", "createShape is passed a non-layer reference");
        
        var patternLayerName;
        if (fillContentShape === "patternLayer") {
            patternLayerName = fillContentShapeVal;
            fillContentShapeVal = [_patternName[patternLayerName][0], _patternName[patternLayerName][1]];
        }
        if (fillContentStroke === "patternLayer") {
            patternLayerName = fillContentStrokeVal;
            fillContentStrokeVal = [_patternName[patternLayerName][0], _patternName[patternLayerName][1]];
        }

        return new PlayObject(
            "make",
            {
                "null": sourceRef,
                "using": {
                    "_obj": "contentLayer",
                    "_value": {
                        "shape": shape.shapeObj(typeShape, shapeVal),
                        "strokeStyle": {
                            "_obj": "strokeStyle",
                            "_value": {
                                "fillEnabled": fillEnabledVal,
                                "strokeEnabled": strokeEnabledVal,
                                "strokeStyleBlendMode": {
                                    "_enum": "blendMode",
                                    "_value": "normal"
                                },
                                "strokeStyleContent": shape.fillContentsObject(fillContentStroke, fillContentStrokeVal),
                                "strokeStyleLineAlignment": {
                                    "_enum": "strokeStyleLineAlignment",
                                    "_value": alignmentTypes[strokeAlignment]
                                },
                                "strokeStyleLineCapType": {
                                    "_enum": "strokeStyleLineCapType",
                                    "_value": _strokeCap[cap]
                                },
                                "strokeStyleLineDashOffset": unitsIn.points(0),
                                "strokeStyleLineDashSet": [],
                                "strokeStyleLineJoinType": {
                                    "_enum": "strokeStyleLineJoinType",
                                    "_value": _strokeCorner[corner]
                                },
                                "strokeStyleLineWidth": unitsIn.points(strokeWidth),
                                "strokeStyleMiterLimit": 100,
                                "strokeStyleOpacity": unitsIn.percent(100),
                                "strokeStyleResolution": 72,
                                "strokeStyleScaleLock": false,
                                "strokeStyleStrokeAdjust": false,
                                "strokeStyleVersion": 2
                            }
                        },
                        "type": shape.fillContentsObject(fillContentShape, fillContentShapeVal)
                    }
                }
            }
        );
    };

    /**
     * Set the border radius of a rectangle layer.
     *
     * @param {number} topLeft
     * @param {?number} topRight 
     * @param {?number} bottomRight
     * @param {?number} bottomLeft
     * @return {PlayObject}
     */
    var setRadius = function (topLeft, topRight, bottomRight, bottomLeft) {
        topRight = topRight || topLeft;
        bottomRight = bottomRight || topLeft;
        bottomLeft = bottomLeft || topLeft;

        return new PlayObject("changePathDetails", {
            "keyActionChangeAllCorners": true,
            "keyOriginRRectRadii": {
                "_obj": "radii",
                "_value": {
                    "topLeft": {
                        "_unit": "pixelsUnit",
                        "_value": topLeft
                    },
                    "topRight": {
                        "_unit": "pixelsUnit",
                        "_value": topRight
                    },
                    "bottomLeft": {
                        "_unit": "pixelsUnit",
                        "_value": bottomLeft
                    },
                    "bottomRight": {
                        "_unit": "pixelsUnit",
                        "_value": bottomRight
                    },
                    "unitValueQuadVersion": 1
                }
            },
            "keyOriginType": originTypes.ORIGIN_RECT
        });
    };
    
    exports.referenceBy = referenceBy;
    exports.contentTypes = contentTypes;
    exports.alignmentTypes = alignmentTypes;
    exports.originTypes = originTypes;

    exports.setStrokeAlignment = setStrokeAlignment;
    exports.setStrokeCap = setStrokeCap;
    exports.setStrokeCorner = setStrokeCorner;
    exports.setStrokeOpacity = setStrokeOpacity;
    exports.setShapeFillTypeSolidColor = setShapeFillTypeSolidColor;
    exports.setStrokeFillTypeSolidColor = setStrokeFillTypeSolidColor;
    exports.setShapeStrokeWidth = setShapeStrokeWidth;
    exports.setStrokeFillTypePattern = setStrokeFillTypePattern;
    exports.setShapeFillTypePattern = setShapeFillTypePattern;
    exports.deleteShapeStyle = deleteShapeStyle;
    exports.moveShape = moveShape;
    exports.createShape = createShape;
    exports.setRadius = setRadius;
});
