var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = /** @class */ (function () {
    function Avocado() {
        var _this = this;
        this.isNative = false;
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        var win = window;
        if (win.avocadoBridge) {
            this.postToNative = function (data) {
                win.avocadoBridge.postMessage(data);
            };
            this.isNative = true;
        }
        else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
            this.postToNative = function (data) {
                win.webkit.messageHandlers.bridge.postMessage(__assign({ type: 'message' }, data));
            };
            this.isNative = true;
        }
        // Load console plugin first to avoid race conditions
        setTimeout(function () { _this.loadCoreModules(); });
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        this.console && this.console.windowLog(args);
    };
    Avocado.prototype.loadCoreModules = function () {
        //this.console = new Console();
    };
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    Avocado.prototype.toNative = function (call) {
        if (this.isNative) {
            // create a unique id for this callback
            call.callbackId = call.pluginId + ++this.callbackIdCount;
            // always send at least an empty obj
            call.options = call.options || {};
            // store the call for later lookup
            this.calls[call.callbackId] = call;
            // post the call data to native
            this.postToNative(call);
        }
        else {
            console.warn("browser implementation unavailable for: " + call.pluginId);
        }
    };
    /**
     * Process a response from the native layer.
     */
    Avocado.prototype.fromNative = function (result) {
        // get the stored call
        var storedCall = this.calls[result.callbackId];
        if (!storedCall) {
            // oopps, this shouldn't happen, something's up
            console.error("stored callback not found: " + result.callbackId);
        }
        else if (typeof storedCall.callbackFunction === 'function') {
            // callback
            // if nativeCallback was used, but wasn't passed a callback function
            // then this gets skipped over, which is good
            // do not remove this call from stored calls cuz it could be used again
            if (result.success) {
                storedCall.callbackFunction(null, result.data);
            }
            else {
                storedCall.callbackFunction(result.error, null);
            }
        }
        else if (typeof storedCall.callbackResolve === 'function') {
            // promise
            // promises will always resolve and reject functions
            if (result.success) {
                storedCall.callbackResolve(result.data);
            }
            else {
                storedCall.callbackReject(result.error);
            }
            // no need to keep this call around for a one time resolve promise
            delete this.calls[result.callbackId];
        }
        else {
            if (!result.success && result.error) {
                // no callback, so if there was an error let's log it
                console.error(result.error.message);
            }
            // no need to keep this call around if there is no callback
            delete this.calls[result.callbackId];
        }
        // always delete to prevent memory leaks
        // overkill but we're not sure what apps will do with this data
        delete result.data;
        delete result.error;
    };
    /**
     * @return the instance of Avocado
     */
    Avocado.instance = function () {
        if (window.avocado) {
            return window.avocado;
        }
        return window.avocado = new Avocado();
    };
    return Avocado;
}());
export { Avocado };
//# sourceMappingURL=avocado.js.map