;(function (window, document) {
    'use strict';

    /**
     *
     */
    var defaults = {
        position: 'right-top'
    };

    /**
     *
     * @param options
     * @constructor
     */
    function Docket(options) {

        if (!(this instanceof Docket)) {
            return new Docket(options);
        } else if (!options.target) {
            throw new Error('You must specify the target element');
        }

        /**
         * @type {Element|null}
         * @private
         */
        this._docket = null;

        /**
         * @type {Element|null}
         * @private
         */
        this._target = null;

        /**
         * @type {string}
         * @private
         */
        this._position = '';

        /**
         *
         * @type {string}
         * @private
         */
        this._count = '';

        /**
         * @type {string}
         * @private
         */
        this._styles = '.docket-pin{font:normal 12px/1 Arial,sans-serif !important;-webkit-box-sizing:border-box !important;box-sizing:border-box !important;position:absolute !important;display:inline-block !important;text-align:center !important;color:#fff !important;padding:4px 3px !important;height:19px !important;min-width:19px !important;-webkit-border-radius:50% !important;border-radius:50% !important;background-color:#fe0000 !important;-webkit-box-shadow:-1px 2px 3px rgba(0,0,0,0.4) !important;box-shadow:-1px 2px 3px rgba(0,0,0,0.4) !important}.docket-pin.right-top{top:-11px;right:-11px}.docket-pin.right-bottom{bottom:-11px;right:-11px}.docket-pin.left-bottom{bottom:-11px;left:-11px}.docket-pin.left-top{top:-11px;left:-11px}';

        this._init(options);
    }

    /**
     *
     * @private
     */
    Docket.prototype._init = function (options) {
        this._target = document.querySelector(options.target);
        this._position = options.position ? options.position : defaults.position;
        this._count = this._target.getAttribute('data-count');

        this._createStyles();
        this._pinDocket();

        //this._writeCookie('patrol', 'pow', {path: '/', expires: 3600});
    };

    /**
     *
     * @private
     */
    Docket.prototype._createStyles = function () {
        var styles = document.createElement('style');
        styles.setAttribute('id', 'docket-styles');
        styles.innerHTML = this._styles;
        document.body.appendChild(styles);
    };

    /**
     *
     * @private
     */
    Docket.prototype._pinDocket = function () {
        this._docket = document.createElement('div');
        this._docket.setAttribute('class', 'docket-pin ' + this._position);
        this._docket.innerHTML = this._count;
        this._target.appendChild(this._docket);
    };

    /**
     *
     * @param {string} name
     * @param {string} value
     * @param {object} options
     * @private
     */
    Docket.prototype._writeCookie = function (name, value, options) {

        options = options || {};
        value = encodeURIComponent(value);

        var expires = options.expires,
            newCookie = name + "=" + value,
            currDate;

        if (typeof expires === 'number' && expires) {
            currDate = new Date();
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
     *
     * @param {string} name
     * @private
     */
    Docket.prototype._readCookie = function (name) {
        var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    /**
     *
     * @param {string} name
     * @private
     */
    Docket.prototype._deleteCookie = function (name) {
        this._writeCookie(name, '', {path: '/', expires: -1})
    };

    window.Docket = Docket;

})(window, document);