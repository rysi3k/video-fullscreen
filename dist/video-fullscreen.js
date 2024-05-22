'use strict';

/**
 * @type {Array} The list of all possible fullscreen APIs.
 */
var API_LIST = [['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror'], ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror'], ['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitCurrentFullScreenElement', 'webkitCancelFullScreen', 'webkitfullscreenchange', 'webkitfullscreenerror'], ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror'], ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError']];

/**
 * Finds a supported fullscreen API.
 *
 * @param   {Array}    apiList      The list of possible fullscreen APIs.
 * @param   {Document} document     The source of the fullscreen interface.
 * @returns {Object}
 */
function findSupported(apiList, document) {

	var standardApi = apiList[0];
	var supportedApi = null;

	for (var i = 0, len = apiList.length; i < len; i++) {

		var api = apiList[i];

		if (api[1] in document) {
			supportedApi = api;
			break;
		}
	}

	if (Array.isArray(supportedApi)) {

		return supportedApi.reduce(function (result, funcName, i) {
			result[standardApi[i]] = funcName;
			return result;
		}, {});
	} else {

		return null;
	}
}

/**
 * Creates a new fullscreen controller.
 *
 * @param   {Array}    apiList      The list of possible fullscreen APIs.
 * @param   {Document} document     The source of the fullscreen interface.
 * @returns {Object}
 */
function createFullscreen(apiList, document) {

	var API = findSupported(apiList, document);
	var TEST_VIDEO = document.createElement('video');

	var activeVideo = null;

	return {

		/**
   * Gets the internal mapping of the browser supported fullscreen API.
   *
   * @returns {Object}
   */
		get api() {

			return API;
		},

		/**
   * Checks whether fullscreen is enabled.
   *
   * @returns {Boolean}
   */
		get enabled() {

			var elementEnabled = API && document[API['fullscreenEnabled']];
			var videoEnabled = TEST_VIDEO['webkitEnterFullscreen'];

			return Boolean(elementEnabled || videoEnabled);
		},

		/**
   * Gets the element that is currently in fullscreen mode.
   *
   * @returns {HTMLElement}
   */
		get element() {

			if (API) {

				return document[API['fullscreenElement']];
			} else {

				return activeVideo && activeVideo['webkitDisplayingFullscreen'] ? activeVideo : null;
			}
		},

		/**
   * Returns whether fullscreen is active for an element, or any element if one is not specified.
   *
   * @param   {HTMLElement}      el       The element to check for fullscreen.
   * @param   {HTMLVideoElement} video    The video element to check for fullscreen.
   * @returns {Boolean}
   */
		isFullscreen: function isFullscreen() {
			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    el = _ref.el,
			    video = _ref.video;

			if (API) {

				return el ? el === this.element : Boolean(this.element);
			} else {

				return video ? video === this.element : Boolean(this.element);
			}
		},


		/**
   * Requests fullscreen.
   *
   * @param {HTMLElement}      el         The element to make the request for. Defaults to the document element.
   * @param {HTMLVideoElement} video      The video element to make the request for.
   */
		request: function request() {
			var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    el = _ref2.el,
			    video = _ref2.video;

			if (API) {

				el = el || document.documentElement;
				return el[API['requestFullscreen']]();
			} else if (video) {

				try {

					activeVideo = video;
					return video['webkitEnterFullscreen']();
				} catch (e) {
					activeVideo = null;
				}
			}
		},


		/**
   * Exits fullscreen.
   */
		exit: function exit() {

			if (API) {

				return document[API['exitFullscreen']]();
			} else if (activeVideo) {

				try {

					activeVideo = null;
					return activeVideo['webkitExitFullscreen']();
				} catch (e) {}
			}
		},


		/**
   * Toggles fullscreen.
   *
   * @param {Object} target
   */
		toggle: function toggle(target) {

			if (this.isFullscreen(target)) {

				this.exit();
			} else {

				this.request(target);
			}
		},


		/**
   * Adds a listener for the fullscreen change event.
   *
   * @param {Function} listener
   */
		onChange: function onChange(listener) {

			if (API) {
				document.addEventListener(API['fullscreenchange'], listener, false);
			}
		},


		/**
   * Removes a listener from the fullscreen change event.
   *
   * @param {Function} listener
   */
		offChange: function offChange(listener) {

			if (API) {
				document.removeEventListener(API['fullscreenchange'], listener, false);
			}
		},


		/**
   * Adds a listener for the fullscreen error event.
   *
   * @param {Function} listener
   */
		onError: function onError(listener) {

			if (API) {
				document.addEventListener(API['fullscreenerror'], listener, false);
			}
		},


		/**
   * Removes a listener from the fullscreen error event.
   *
   * @param {Function} listener
   */
		offError: function offError(listener) {

			if (API) {
				document.removeEventListener(API['fullscreenerror'], listener, false);
			}
		}
	};
}

/**
 * @type {Object} The fullscreen controller for the current environment.
 */
var fullscreen = createFullscreen(API_LIST, document);

module.exports = fullscreen;
