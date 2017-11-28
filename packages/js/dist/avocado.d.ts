import { PluginCall, PluginResult } from './definitions';
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
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    toNative(call: PluginCall): void;
    /**
     * Process a response from the native layer.
     */
    fromNative(result: PluginResult): void;
    /**
     * @return the instance of Avocado
     */
    static instance(): any;
}
