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

    return {
        hasConsent: hasConsent,

        /**
         * localStorage when functional cookies are accepted, otherwise a store that keeps nothing.
         *
         * @return {Storage|Object}
         */
        functionalLocalStorage: function() {
            return hasConsent('functional') ? window.localStorage : nostorage;
        },

        /**
         * A core/storagewrapper over localStorage when functional cookies are accepted, otherwise a store that keeps nothing.
         *
         * @param {Function} StorageWrapper The core/storagewrapper class.
         * @return {Object}
         */
        functionalStorageWrapper: function(StorageWrapper) {
            return hasConsent('functional') ? new StorageWrapper(window.localStorage) : nostorage;
        }
    };
});
