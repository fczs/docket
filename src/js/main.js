;(function (window, document) {
    'use strict';

    /**
     * Default options for the Docket.
     * @public
     */
    Docket.defaults = {
        position: 'right-top',
        margin: [0, 0],
        expires: 0
    };

    /**
     * @class The Docket.
     * @public
     * @param {Object} options
     * @constructor
     */
    function Docket(options) {

        if (!(this instanceof Docket)) {
            return new Docket(options);
        } else if (!options.parent) {
            throw new Error('You must specify the parent element');
        }

        /**
         * Docket main element.
         * @type {Element}
         * @private
         */
        this._docket = null;

        /**
         * The element in which the Docket should be nested.
         * @type {Element}
         * @private
         */
        this._parent = null;

        /**
         * Posts timestamps.
         * @type {Array}
         * @private
         */
        this._posts = [];

        /**
         * Docket position in the parent element. Available options:
         * right-top (by default)
         * right-bottom
         * left-bottom
         * left-top
         * @type {String}
         * @private
         */
        this._position = '';

        /**
         * Docket margins (X, Y) relative to the parent element.
         * @type {Array}
         * @private
         */
        this._margin = [];

        /**
         * Date/time the cookie expires in seconds.
         * @type {Number}
         * @private
         */
        this._expires = null;

        /**
         * The condition for the Docket removing.
         * @type {String}
         * @private
         */
        this._targetPage = '';

        /**
         * The conditional element for the Docket deduction.
         * @type {Element}
         * @private
         */
        this._targetItem = null;

        /**
         * Current date.
         * @type {Date}
         * @private
         */
        this._currDate = new Date();

        /**
         * The name of the Docket cookie.
         * @type {String}
         * @private
         */
        this._cookieName = 'docket-history';

        /**
         * Docket styles sheet.
         * @type {String}
         * @private
         */
        this._styles = '<style>';

        this.init(options);
    }

    /**
     * Initializes the Docket.
     * @param {Object} options
     * @private
     */
    Docket.prototype.init = function (options) {
        this._parent = document.querySelector(options.parent);
        this._posts = this.getPosts(this._parent.getAttribute('data-timestamp'));
        this._position = options.position || Docket.defaults.position;
        this._margin = options.margin || Docket.defaults.margin;
        this._expires = parseInt(options.expires) || Docket.defaults.expires;
        if (options.targetPage)
            this._targetPage = this.trimSlashes(options.targetPage.trim());
        if (options.targetItem)
            this._targetItem = document.querySelector(options.targetItem);
        if (this._posts)
            this.checkConditions();
    };

    /**
     * Checks the conditions for the Docked behaviour.
     * @private
     */
    Docket.prototype.checkConditions = function () {
        var count = this.countItems();

        if (count > 0)
            this.createStyles().pinDocket(count);

        if (this._targetPage !== '') {
            if (this._targetPage === this.trimSlashes(this.getLocation()))
                this.setHistory().unpinDocket();
        } else if (this._targetItem) {
            //
        }
    };

    /**
     * Gets the array of the posts timestamps.
     * @param {String} strPosts
     * @return {Array|Boolean}
     * @private
     */
    Docket.prototype.getPosts = function (strPosts) {
        var posts = typeof strPosts !== 'undefined' ? strPosts.split(',') : '';
        if (posts[0] !== '') {
            for (var i = 0; i < posts.length; i++) {
                posts[i] = posts[i].trim();
                if (posts[i] === '')
                    posts.slice(i, 1);
            }
            return posts;
        }
        return false;
    };

    /**
     * Gets the current URL with trimmed host and query params.
     * @return {String}
     * @private
     */
    Docket.prototype.getLocation = function () {
        return window.location.href
            .toString()
            .split(window.location.host)[1]
            .split('?')[0];
    };

    /**
     * Trims slashes at the start and the end of the string.
     * @param {String} str
     * @return {String}
     * @private
     */
    Docket.prototype.trimSlashes = function (str) {
        return str.replace(/^\/|\/$/g, '');
    };

    /**
     * $(document).ready analog.
     * @param {Function} callback
     * @private
     */
    Docket.prototype.documentReady = function (callback) {
        if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };

    /**
     * Adds the Docket styles to DOM.
     * @return {Docket}
     * @private
     */
    Docket.prototype.createStyles = function () {
        var styles = document.createElement('style'),
            position = this._position.split('-');

        this._styles += '.docket-pin.' + this._position + '{' + position[0] + ':-' + this._margin[0] + 'px;' + position[1] + ':-' + this._margin[1] + 'px}';
        styles.setAttribute('id', 'docket-styles');
        styles.innerHTML = this._styles;
        document.body.appendChild(styles);
        return this;
    };

    /**
     * Creates and pins the Docket.
     * @param {Number} count
     * @return {Docket}
     * @private
     */
    Docket.prototype.pinDocket = function (count) {
        this._docket = document.createElement('div');
        this._docket.setAttribute('class', 'docket-pin ' + this._position);
        this._docket.innerHTML = count;
        this._parent.style.position = 'relative';
        this._parent.appendChild(this._docket);
        return this;
    };

    /**
     * @param {String} name
     * @param {String} value
     * @param {Object} options
     * @private
     */
    Docket.prototype.writeCookie = function (name, value, options) {
        options = options || {};
        value = encodeURIComponent(value);

        var expires = options.expires,
            newCookie = name + "=" + value,
            currDate = this._currDate;

        if (typeof expires === 'number' && expires) {
            currDate.setTime(currDate.getTime() + expires * 1000);
            expires = options.expires = currDate;
        }

        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        for (var prop in options) {
            newCookie += '; ' + prop;
            if (options[prop] !== true)
                newCookie += '=' + options[prop];
        }

        document.cookie = newCookie;
    };

    /**
     * @param {String} name
     * @private
     */
    Docket.prototype.readCookie = function (name) {
        var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    /**
     * Counts the unseen items that will be displayed in the Docket.
     * @return {Number}
     * @private
     */
    Docket.prototype.countItems = function () {
        var count = this._posts.length,
            cookie = this.readCookie(this._cookieName);
        if (cookie) {
            cookie = cookie.split(',');
            for (var i = 0; i < cookie.length; i++) {
                if (this._posts.indexOf(cookie[i]) !== -1)
                    count--;
            }
        }
        return count;
    };

    /**
     * Saves the list of items that were viewed by the user.
     * @return {Docket}
     * @private
     */
    Docket.prototype.setHistory = function () {
        this.writeCookie(this._cookieName, this._posts.toString(), {
            path: '/',
            expires: this._expires
        });
        return this;
    };

    /**
     * Removes the Docket from the screen.
     * @return {Docket}
     * @public
     */
    Docket.prototype.unpinDocket = function () {
        if (this._docket !== null) {
            this.documentReady(function () {
                setTimeout(function () {
                    this._docket.classList.add('docket-unpin');
                }.bind(this), 500);
            }.bind(this));
        }
        return this;
    };

    /**
     * Removes the Docket cookie.
     * @public
     */
    Docket.prototype.deleteCookie = function () {
        this.writeCookie(this._cookieName, '', {path: '/', expires: -1});
    };

    /**
     * The constructor for the plugin
     * @public
     */
    window.Docket = Docket;

})(window, document);