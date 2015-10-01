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
        referenceBy = require("./reference").wrapper("document"),
        referenceOf = require("./reference").refersTo,
        unitsIn = require("./unit"),
        assert = require("../util").assert,
        _ = require("lodash");
        

    /**
     * Open a document (psd, png, jpg, ai, gif)
     * 
     * @param {ActionDescriptor} sourceRef document reference
     * @param {string} settings.pdfSelection "page" or "image"
     * @param {number} settings.pageNumber The number of the page
     * @param {boolean} settings.suppressWarnings true or false
     * @param {string} settings.name The name of the Document.
     * @param {number} settings.bitDepth The bit depth. 8 or 16
     * @param {string} settings.box Box to crop to. See openDocument.cropTo vals 
     * @param {boolean} settings.bAntiAlias true or false
     * @param {boolean} settings.bConstrainProportions true or false
     * @param {number} settings.width The width of the image size.
     * @param {number} settings.height The height of the image size
     * @param {string} settings.colorSpace The color space of the image mode.  See openDocument.mode vals
     * @param {number} settings.resolution The resolution value
     *
     * @return {PlayObject}
     *
     */
    var openDocument = function (sourceRef, settings) {
        var params = {
                pdfSelection: settings.pdfSelection || "page",
                pageNumber: settings.pageNumber || 1,
                suppressWarnings: settings.suppressWarnings || false,
                name: settings.name || sourceRef.name,
                bitDepth: settings.bitDepth || 8,
                box: settings.box || "boundingBox",
                bAntiAlias: settings.bAntiAlias || true,
                bConstrainProportions: settings.bConstrainProportions || true,
                width: settings.width || sourceRef.width,
                height: settings.height || sourceRef.height,
                colorSpace: settings.colorSpace || "RGBColorMode",
                resolution: settings.resolution
            },
            fileType,
            strIndex = sourceRef._path.lastIndexOf(".");

        if (strIndex !== -1) {
            strIndex++;
            fileType = sourceRef._path.substring(strIndex);
        }

        var desc = {
            "null": sourceRef
        };

        if (fileType === "ai") {
            desc.as._obj = "PDFGenericFormat";
            desc.as._value.selection = {
                "_enum": "pdfSelection",
                "_value": params.pdfSelection
            };
            desc.as._value.suppressWarnings = params.suppressWarnings;
            desc.as._value.pageNumber = params.pageNumber;
            if (params.pdfSelection === "page") {
                desc.as._value = {
                    "antiAlias": params.bAntiAlias,
                    "constrainProportions": params.bConstrainProportions,
                    "crop": {
                        "_enum": "cropTo",
                        "_value": openDocument.cropTo[params.box]
                    },
                    "depth": params.bitDepth,
                    "width": unitsIn.pixels(params.width),
                    "height": unitsIn.pixels(params.height),
                    "mode": {
                        "_enum": "colorSpace",
                        "_value": openDocument.mode[params.colorSpace]
                    },
                    "name": params.name,
                    "resolution": unitsIn.density(params.resolution)
                };
            }
        }

        return new PlayObject(
            "open",
            desc
        );
    };

    openDocument.cropTo = {
        bounding: "boundingBox",
        media: "mediaBox",
        crop: "cropBox",
        bleed: "bleedBox",
        trim: "trimBox",
        art: "artBox"
    };

    openDocument.mode = {
        rgb: "RGBColorMode",
        gray: "grayscaleMode",
        cmyk: "CMYKColorMode",
        lab: "labColorMode"
    };

    /**
     * Close a document without saving
     * 
     * @param {number} documentID
     * @param {string=} save Whether the document should be saved. "yes", "no"
     * @return {PlayObject}
     *
     * Preconditions:
     * The document should be saved previously and have fileReference path value for saving.
     */
    var closeDocument = function (documentID, save) {
        var desc = {
            documentID: documentID
        };

        if (save) {
            desc.saving = {
                "_enum": "yesNo",
                "_value": save
            };
        }

        return new PlayObject(
            "close",
            desc
        );
    };

    /**
     * Save a document
     * 
     * @param {string} path The full path to save a file.
     * @param {!Object} settings An object with params
     * @param {string} settings.gifColorPalette GIF color palette. See saveDocument.gifColorPalette
     * @param {string} settings.gifForcedColors GIF forced color. See saveDocument.gifForcedColors
     * @param {boolean} settings.gitTransparency GIF Transparency
     * @param {string} settings.gifRowOrder GIF Format Option.  normal or interlaced
     * @param {number} settings.jpgExtendedQuality JPG Quality. 0 to 10
     * @param {string} settings.jpgFormatOptions JPG Format Option. standard, optimized, or progressive
     * @param {number} settings.jpgProgressiveScans The number of Scans. 3 to 5
     * @param {number} settings.pngCompression PNG compression. none or smallest
     * @param {number} settings.pngInterlace PNG interlace. none or interlaced

     * @param {boolean} settings.embedProfiles Whether embed color profile
     * 
     * @return {PlayObject}
     */
    var saveDocument = function (path, settings) {
        var strIndex = path.lastIndexOf("."),
            pathIndex = path.lastIndexOf("/"),
            fileType,
            fileName,
            filePath,
            desc,
            saveAs = {},
            saveTo = {},
            params = {
                gifColorPalette: settings.gifColorPalette || "exact",
                gifRowOrder: settings.gifRowOrder || "normal",
                gifForcedColors: settings.gifForcedColors || "blackAndWhite",
                gitTransparency: settings.gitTransparency || true,
                jpgExtendedQuality: settings.jpgExtendedQuality || 8,
                jpgFormatOptions: settings.jpgFormatOptions || "standard",
                jpgProgressiveScans: settings.jpgProgressiveScans || 3,
                pngCompression: settings.pngCompression,
                pngInterlace: settings.pngInterlace,
                embedProfiles: settings.embedProfiles || false
            };
        if (strIndex !== -1) {
            strIndex++;
            fileType = path.substring(strIndex);
        }
        if (pathIndex !== -1) {
            pathIndex++;
            fileName = path.substring(pathIndex);
        }
        filePath = path.replace(fileName, "");

        if (fileType === "gif") {
            saveAs = {
                "_obj": "GIFFormat",
                "_value": {
                    "interfaceIconFrameDimmed": saveDocument.gifRowOrder[params.gifRowOrder]
                }
            };
            saveTo = {
                "_obj": "indexedColorMode",
                "_value": {
                    "palette": {
                        "_enum": "colorPalette",
                        "_value": saveDocument.gifColorPalette[params.gifColorPalette]
                    },
                    "forcedColors": {
                        "_enum": "forcedColors",
                        "_value": saveDocument.gifForcedColors[params.gifForcedColors]
                    },
                    "transparency": params.gitTransparency
                }
            };
        } else if (fileType === "psd") {
            saveAs = {
                "_obj": "photoshop35Format",
                "_value": {}
            };
        } else if (fileType === "jpg") {
            saveAs = {
                "_obj": "JPEG",
                "_value": {
                    "extendedQuality": params.jpgExtendedQuality,
                    "matteColor": {
                        "_enum": "matteColor",
                        "_value": "none"
                    }
                }
            };
        } else if (fileType === "png") {
            saveAs = {
                "_obj": "PNGFormat",
                "_value": {
                    "PNGInterlaceType": {
                        "_enum": "PNGInterlaceType",
                        "_value": saveDocument.pngInterlace[params.pngInterlace]
                    },
                    "compression": saveDocument.pngCompression[params.pngCompression]
                }
            };
        }
        desc = {
            "as": saveAs,
            "in": {
                "_path": path
            }
        };
        if (fileType === "gif") {
            desc.to = saveTo;
            desc.copy = true;
        } else {
            desc.embedProfiles = params.embedProfiles;
        }
        return new PlayObject(
            "make",
            desc
        );
    };
    saveDocument.pngCompression = {
        none: 0,
        smallest: 9
    };
    saveDocument.pngInterlace = {
        none: "PNGInterlaceNone",
        interlaced: "PNGInterlaceAdam7"
    };
    saveDocument.gifColorPalette = {
        exact: "exact",
        mac: "macintoshSystem",
        window: "windowsSystem",
        web: "web",
        localPerceptual: "perceptual",
        localSelective: "selective",
        localAdaptive: "adaptive",
        previous: "previous"
    };
    saveDocument.gifRowOrder = {
        normal: false,
        interlaced: true
    };
    saveDocument.gifForcedColors = {
        none: "none",
        blackAndWhite: "blackAndWhite",
        primaries: "primaries",
        web: "web"
    };

    /**
     * Select a document
     * 
     * @param {ActionDescriptor} sourceRef document reference
     *
     * @return {PlayObject}
     *
     */
    var selectDocument = function (sourceRef) {
        assert(referenceOf(sourceRef) === "document", "selectDocument is passed a non-document reference");
        
        var desc = {
            "null": sourceRef
        };
        return new PlayObject(
            "select",
            desc
        );
    };

    /**
     * Return a document path to be used for opening or saving a document.
     * 
     * @param {string} path document path
     *
     * @return {PlayObject}
     *
     */
    referenceBy.path = function (path) {
        return {
            descriptor: {
                "null": path
            }
        };
    };

    /**
     * Create a document
     * 
     * @param {number} settings.width The document width.
     * @param {number} settings.height The document height.
     * @param {number} settings.resolution The document resolution.
     * @param {string} settings.fill The document fill. "white", "backgroundColor", "transparency"
     * @param {string} settings.colorMode The document color mode. "RGBColorMode", "bitmapMode", "grayscaleMode" 
                        "CMYKColorMode", "labColorMode"
     * @param {number} settings.depth The color mode depth
     * @param {string} settings.colorProfile The document color profile. "sRGB IEC61966-2.1", "Adobe RGB (1998)",
     *  default: "none"
     * @param {string} settings.pixelAspectRatio The document pixel aspect ratio. 
     *
     * @return {PlayObject}
     *
     */
    var createDocument = function (settings) {
        var params = {
            width: settings.width || 7,
            height: settings.width || 5,
            resolution: settings.resolution || 72,
            fill: settings.fill || "white",
            colorMode: settings.colorMode || "RGBColorMode",
            depth: settings.depth || 8,
            colorProfile: settings.colorProfile || "none",
            pixelAspectRatio: settings.pixelAspectRatio || 1
        };

        var newObj = {
            "_obj": "document",
            "_value": {
                "width": unitsIn.distance(params.width),
                "height": unitsIn.distance(params.height),
                "resolution": unitsIn.density(params.resolution),
                "fill": {
                    "_enum": "fill",
                    "_value": params.fill
                },
                "mode": {
                    "_class": params.colorMode
                },
                "depth": params.depth,
                "profile": params.colorProfile,
                "pixelScaleFactor": params.pixelAspectRatio
            }
        };

        var desc = {
            "new": newObj
        };

        return new PlayObject(
            "make",
            desc
        );
    };

    /**
     * Create a document using a simple preset string identifier
     *
     * @param {string} presetName identifier of the preset
     * @return {PlayObject}
     */
    var createWithPreset = function (presetName) {
        var desc = {
                "new": {
                    "_obj": "document",
                    "_value": {
                        preset: presetName
                    }
                }
            };
        return new PlayObject(
            "make",
            desc
        );
    };

    /**
     * Resizes the canvas of current document
     * 
     * @param {Unit} width Width in units
     * @param {Unit} height Height in units
     * @param {string} horizontalExtension option to stretch the canvas horizontally, default center
     * @param {string} verticalExtension option to strecth canvas vertically, default center
     *
     * @returns {PlayObject}
     */
    var resizeDocument = function (width, height, horizontalExtension, verticalExtension) {
        horizontalExtension = horizontalExtension || "center";
        verticalExtension = verticalExtension || "center";

        return new PlayObject(
            "canvasSize",
            {
                "canvasExtensionColorType": {
                    "_enum": "canvasExtensionColorType",
                    "_value": "backgroundColor"
                },
                "height": height,
                "width": width,
                "horizontal": {
                    "_enum": "horizontalLocation",
                    "_value": horizontalExtension
                },
                "vertical": {
                    "_enum": "verticalLocation",
                    "_value": verticalExtension
                }
            }
        );
    };

    /**
     * Set the Target Path property of the document. This is available in
     * the classic UI menu as View > Extras..Show > Target Path
     * 
     * @param {object} sourceRef
     * @param {boolean} enabled
     * @return {PlayObject}
     */
    var setTargetPathVisible = function (sourceRef, enabled) {
        assert(referenceOf(sourceRef) === "document", "setTargetPathVisible is passed a non-document reference");

        var reference = {
            "_ref": [
                {
                    "_ref": "property",
                    "_property": "targetPathVisibility"
                },
                sourceRef
            ]
        };

        var descriptor = {
            null: reference,
            to: enabled
        };

        return new PlayObject("set", descriptor);
    };

    /**
     * Creates a guide in the given position with given orientation in the document
     *
     * @param {object} sourceRef
     * @param {"horizontal"|"vertical"} orientation Guide orientation
     * @param {number} position Position of guide in pixels
     * @param {boolean} isArtboardGuide If true, the guide will be created as an artboard guide
     * @return {PlayObject}
     */
    var insertGuide = function (sourceRef, orientation, position, isArtboardGuide) {
        assert(referenceOf(sourceRef) === "document", "insertGuide is passed a non-document reference");

        var reference = {
                "_ref": "guide"
            },
            guideReference = {
                "_ref": [
                    sourceRef,
                    { "_class": "guide" }
                ]
            };
              
        var descriptor = {
            null: reference,
            new: {
                "_obj": "guide",
                "null": guideReference,
                "orientation": {
                    "_enum": "orientation",
                    "_value": orientation
                },
                "position": unitsIn.pixels(position)
            },
            "guideTarget": {
                "_enum": "guideTarget",
                "_value": isArtboardGuide ? "guideTargetSelectedArtboard" : "guideTargetDocument"
            }
        };

        return new PlayObject("newGuide", descriptor);
    };

    /**
     * Deletes the guide in the given position in the document
     *
     * @param {object} sourceRef
     * @param {number} guideIndex Index of guide in the document
     * @return {PlayObject}
     */
    var removeGuide = function (sourceRef, guideIndex) {
        assert(referenceOf(sourceRef) === "document", "removeGuide is passed a non-document reference");

        var descriptor = {
            null: {
                "_ref": [
                    {
                        "_ref": "guide",
                        "_index": guideIndex
                    },
                    sourceRef
                ]
            }
        };

        return new PlayObject("delete", descriptor);
    };

    /**
     * Sets the artboard auto properties, given they're provided
     * This is available in the classic UI when artboard tool is selected under the gear icon.
     *
     * @param {object} sourceRef
     * @param {object} attributes
     * @param {?boolean} attributes.autoNestEnabled When layers are moved, they will be automatically nested 
     *                                              into the artboard they're over
     * @param {?boolean} attributes.autoPositionEnabled When a layer being reordered into an artboard
     *                                                  will be moved to be inside the artboard
     * @param {?boolean} attributes.autoExpandEnabled When artboards are moved, if they go outside the canvas
     *                                                it will be automatically expanded to fit everything
     * @return {PlayObject}
     */
    var setArtboardAutoAttributes = function (sourceRef, attributes) {
        assert(referenceOf(sourceRef) === "document", "setArtboardAutoAttributes is passed a non-document reference");
        assert(attributes !== {}, "setArtboardAutoAttributes requires at least one attribute");
        
        var reference = {
            "_ref": [
                {
                    "_ref": "property",
                    "_property": "artboards"
                },
                sourceRef
            ]
        };

        var descriptor = {
            null: reference,
            to: attributes
        };

        return new PlayObject("set", descriptor);
    };

    /**
     * Build the base descriptor for guide visibility
     *
     * @private
     * @param {string} guideType either "guidesVisibility" or "smartGuidesVisibility"
     * @return {PlayObject}
     */
    var _buildGuidesDescriptor = function (guideType) {
        return {
            "null": {
                "_ref": [{
                    "_ref": "property",
                    "_property": guideType
                }, {
                    "_ref": "document",
                    "_enum": "ordinal",
                    "_value": "targetEnum"
                }]
            }
        };
    };

    /**
     * Guide Visibility descriptors (regular and smart)
     *
     * @private
     * @type {PlayObject}
     */
    var _guidesDescriptor = _buildGuidesDescriptor("guidesVisibility"),
        _smartGuidesDescriptor = _buildGuidesDescriptor("smartGuidesVisibility");

    /**
     * Generate a PlayObject to get the visibility of Guides for the current document
     * 
     * @return {PlayObject}
     */
    var getGuidesVisibility = function () {
        return new PlayObject("get", _guidesDescriptor);
    };

    /**
     * Generate a PlayObject to get the visibility of Smart Guides for the current document
     * 
     * @return {PlayObject}
     */
    var getSmartGuidesVisibility = function () {
        return new PlayObject("get", _smartGuidesDescriptor);
    };

    /**
     * Generate a PlayObject to set the visibility of Guides for the current document
     *
     * @param {boolean} enabled
     * @return {PlayObject}
     */
    var setGuidesVisibility = function (enabled) {
        var setter = _.clone(_guidesDescriptor);
        setter.to = enabled;
        return new PlayObject("set", setter);
    };

    /**
     * Generate a PlayObject to set the visibility of Smart Guides for the current document
     *
     * @param {boolean} enabled
     * @return {PlayObject}
     */
    var setSmartGuidesVisibility = function (enabled) {
        var setter = _.clone(_smartGuidesDescriptor);
        setter.to = enabled;
        return new PlayObject("set", setter);
    };

    /**
     * build a reference for documentExtensionData
     *
     * @private
     * @param {number|object} docRef either a document ID or a document reference
     * @param {string} namespace top-level property within the documentExtensionData object
     * @return {object}
     */
    var _extensionDataReference = function (docRef, namespace) {
        var _docRef;
        
        if (Number.isFinite(docRef)) {
            _docRef = referenceBy.id(docRef);
        } else {
            _docRef = docRef;
        }

        return {
            _ref: [
                {
                    _ref: null,
                    _property: namespace
                },
                {
                    _ref: null,
                    _property: "documentExtensionData"
                },
                _docRef
            ]
        };
    };

    /**
     * Build a PlayObject to get all extension data within a namespace (top-level property)
     *
     * @param {number|object} docRef either a document ID or a document reference
     * @param {string} namespace top-level property within the documentExtensionData Object
     * @return {PlayObject}
     */
    var getExtensionData = function (docRef, namespace) {
        return new PlayObject("get", { "null": _extensionDataReference(docRef, namespace) });
    };

    /**
     * Build a PlayObject to set a single key/value pair within the given Extension Data namespace
     *
     * @param {number|object} docRef either a document ID or a document reference
     * @param {string} namespace top-level property within the documentExtensionData object
     * @param {string} key sub-property name
     * @param {string} value
     * @return {PlayObject}
     */
    var setExtensionData = function (docRef, namespace, key, value) {
        var to = {};
        to[key] = value;
        
        return new PlayObject("set", {
            "null": _extensionDataReference(docRef, namespace),
            "to": to
        });
    };

    exports.referenceBy = referenceBy;
    
    exports.open = openDocument;
    exports.close = closeDocument;
    exports.save = saveDocument;
    exports.select = selectDocument;
    exports.create = createDocument;
    exports.createWithPreset = createWithPreset;
    exports.resize = resizeDocument;
    exports.insertGuide = insertGuide;
    exports.removeGuide = removeGuide;
    exports.setArtboardAutoAttributes = setArtboardAutoAttributes;
    exports.setTargetPathVisible = setTargetPathVisible;
    exports.getGuidesVisibility = getGuidesVisibility;
    exports.getSmartGuidesVisibility = getSmartGuidesVisibility;
    exports.setGuidesVisibility = setGuidesVisibility;
    exports.setSmartGuidesVisibility = setSmartGuidesVisibility;
    exports.getExtensionData = getExtensionData;
    exports.setExtensionData = setExtensionData;
});
