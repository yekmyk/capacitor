import { PluginCaller, PluginCall, PluginResult } from './definitions';
import { Plugin } from './plugin';
/**
 * Main class for interacting with the Avocado runtime.
 */
export declare class Avocado {
    private console;
    private postToNative;
    isNative: boolean;
    private calls;
    private callbackIdCount;
    constructor();
    private log(...args);
    private loadCoreModules();
    registerPlugin(plugin: Plugin): void;
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    toNative(call: PluginCall, caller: PluginCaller): any;
    private _toNativeCallback(call, caller);
    private _toNativePromise(call, caller);
    private _saveCallback(call, callbackHandler);
    /**
     * Process a response from the native layer.
     */
    fromNative(result: PluginResult): void;
    private _fromNativeCallback(result, storedCall);
    /**
     * @return the instance of Avocado
     */
    static instance(): any;
}
