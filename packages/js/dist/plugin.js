import { Avocado } from './avocado';
/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        this.avocado = Avocado.instance();
        this.avocado.registerPlugin(this);
        this.isNative = this.avocado.isNative;
    }
    Plugin.prototype.send = function (method, a, b) {
        if (typeof a === 'function') {
            return this.toPlugin(method, {}, 'callback', a);
        }
        if (typeof b === 'function') {
            return this.toPlugin(method, a || {}, 'callback', b);
        }
        return this.toPlugin(method, a || {}, 'promise', null);
    };
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    Plugin.prototype.toPlugin = function (methodName, options, callbackType, callbackFunction) {
        var config = this.constructor.getPluginInfo();
        if (this.avocado.isNative) {
            return this.avocado.toNative({
                pluginId: config.id,
                methodName: methodName,
                options: options,
                callbackType: callbackType
            }, {
                callbackFunction: callbackFunction
            });
        }
        if (typeof config.browser !== 'function') {
            console.warn("\"" + config.name + "\" browser plugin not found");
            return Promise.resolve();
        }
        if (!this.browserPlugin) {
            this.browserPlugin = new config.browser();
        }
        if (typeof this.browserPlugin[methodName] !== 'function') {
            console.warn("\"" + config.name + "\" browser plugin missing \"" + methodName + "\" method");
            return Promise.resolve();
        }
        return this.browserPlugin[methodName](options, callbackFunction);
    };
    return Plugin;
}());
export { Plugin };
/**
 * Decorator for AvocadoPlugin's
 */
export function AvocadoPlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () { return cls['_avocadoPlugin']; };
        return cls;
    };
}
