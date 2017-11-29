import { Avocado } from './avocado';
/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        this.avocado = Avocado.instance();
        this.isNative = this.avocado.isNative;
    }
    Plugin.prototype.nativeCallback = function (methodName, options, callback) {
        if (typeof options === 'function') {
            // 2nd arg was a function
            // so it's the callback, not options
            callback = options;
            options = {};
        }
        this.avocado.toNative({
            pluginId: this.pluginId(),
            methodName: methodName,
            options: options,
            callbackFunction: callback
        });
    };
    Plugin.prototype.nativePromise = function (methodName, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.avocado.toNative({
                pluginId: _this.pluginId(),
                methodName: methodName,
                options: options,
                callbackResolve: resolve,
                callbackReject: reject
            });
        });
    };
    Plugin.prototype.pluginId = function () {
        var config = this.constructor.getPluginInfo();
        return config.id;
    };
    return Plugin;
}());
export { Plugin };
/**
 * Decorator for AvocadoPlugin's
 */
export function NativePlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () { return cls['_avocadoPlugin']; };
        return cls;
    };
}
