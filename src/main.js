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

/* global _spaces */

define(function (require, exports) {
    "use strict";

    var Promise = require("bluebird");

    /**
     * Promisified version of _spaces.openURLInDefaultBrowser.
     */
    var _openURLInDefaultBrowserAsync = Promise.promisify(_spaces.openURLInDefaultBrowser);

    /**
     * The minimum-compatible plugin version number. 
     *
     * @const
     * @type {{major: number=, minor: number=, patch: number=}}
     */
    var COMPATIBLE_PLUGIN_VERSION = {
        major: 1,
        minor: 0,
        patch: 0
    };

    Object.defineProperties(exports, {
        /**
         * Version of the Spaces adapter plugin API.
         * Follows Semver 2.0.0 conventions: http://semver.org/spec/v2.0.0.html
         *
         * @const
         * @type {string}
         */
        "version": {
            enumerable: true,
            value: _spaces.version
        },

        /**
         * Abort the current application and return control to Classic Photoshop.
         * If a message is supplied, Classic Photoshop may display it to the user,
         * e.g., in a dialog.
         * 
         * @param {{message: string=}}
         * @return {Promise}
         */
        "abort": {
            enumerable: true,
            value: Promise.promisify(_spaces.abort)
        }
    });

    /**
     * Determine whether v1 is less than or equal to v2.
     * 
     * @private
     * @param {{major: number=, minor: number=, patch: number=}} v1
     * @param {{major: number=, minor: number=, patch: number=}} v2
     * @return {boolean}
     */
    var _versionLessThanOrEqualTo = function (v1, v2) {
        if (v1.hasOwnProperty("major") && v1.major > v2.major) {
            return false;
        }

        if (v1.hasOwnProperty("minor") && v1.minor > v2.minor) {
            return false;
        }

        if (v1.hasOwnProperty("patch") && v1.patch > v2.patch) {
            return false;
        }

        return true;
    };

    /**
     * Format a version object a string.
     * 
     * @private
     * @param {{major: number=, minor: number=, patch: number=}} version
     * @return {string}
     */
    var _formatVersion = function (version) {
        return [version.major, version.minor, version.patch].join(".");
    };

    /**
     * Assert that the current plugin version is compatible with the specified
     * minimum-compatible plugin version.
     * 
     * @throws {Error} If the current plugin version is incompatible with the
     *  minimum compatible plugin version.
     */
    var _assertPluginVersionIsCompatible = function () {
        var pluginVersion = _spaces.version;

        if (!_versionLessThanOrEqualTo(COMPATIBLE_PLUGIN_VERSION, pluginVersion)) {
            var message = "Plugin version " + _formatVersion(pluginVersion) +
                " is incompatible with the minimum required version, " +
                 _formatVersion(COMPATIBLE_PLUGIN_VERSION);

            throw new Error(message);
        }
    };

    /**
     * Opens the given URL in the user's default browser.
     *
     * @param {string} url The URL to open in the user's default browser.
     * @return {Promise}
     */
    var openURLInDefaultBrowser = function (url) {
        return _openURLInDefaultBrowserAsync(url);
    };

    exports.openURLInDefaultBrowser = openURLInDefaultBrowser;

    // Assert plugin compatibility at load time
    _assertPluginVersionIsCompatible();
});
