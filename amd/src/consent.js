// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * CookieYes consent checks for browser storage.
 *
 * @module     format_remuiformat/consent
 * @copyright  Financial Edge
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([], function() {
    /**
     * Whether the visitor has accepted a CookieYes category, read from the cookieyes-consent cookie
     * (e.g. "consentid:...,consent:yes,necessary:yes,functional:no,analytics:no").
     *
     * @param {string} category CookieYes category, e.g. 'functional'.
     * @return {boolean}
     */
    function hasConsent(category) {
        var match = document.cookie.match(/(?:^|;\s*)cookieyes-consent=([^;]*)/);
        if (!match) {
            return false;
        }
        var pairs = decodeURIComponent(match[1]).split(',');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split(':');
            if (pair[0] === category) {
                return pair[1] === 'yes';
            }
        }
        return false;
    }

    // Stands in for localStorage and core/storagewrapper when there is no consent: stores nothing.
    var nostorage = {
        getItem: function() {
            return null;
        },
        setItem: function() {
            return false;
        },
        removeItem: function() {
            return false;
        },
        get: function() {
            return null;
        },
        set: function() {
            return false;
        }
    };

    /**
     * A store whose methods check functional consent on every call, so withdrawing or giving consent
     * without a page reload takes effect straight away.
     *
     * @param {Function} getStore Returns the real store, only called with consent.
     * @param {string[]} methods Method names to pass through.
     * @return {Object}
     */
    function consentStore(getStore, methods) {
        var store = {};
        methods.forEach(function(method) {
            store[method] = function() {
                if (!hasConsent('functional')) {
                    return nostorage[method].apply(nostorage, arguments);
                }
                var real = getStore();
                return real[method].apply(real, arguments);
            };
        });
        return store;
    }

    return {
        hasConsent: hasConsent,

        /**
         * localStorage that is only read and written while functional cookies are accepted.
         *
         * @return {Object} With getItem, setItem and removeItem.
         */
        functionalLocalStorage: function() {
            return consentStore(function() {
                return window.localStorage;
            }, ['getItem', 'setItem', 'removeItem']);
        },

        /**
         * A core/storagewrapper over localStorage that is only used while functional cookies are accepted.
         *
         * @param {Function} StorageWrapper The core/storagewrapper class.
         * @return {Object} With get and set.
         */
        functionalStorageWrapper: function(StorageWrapper) {
            var wrapper = null;
            return consentStore(function() {
                wrapper = wrapper || new StorageWrapper(window.localStorage);
                return wrapper;
            }, ['get', 'set']);
        }
    };
});
