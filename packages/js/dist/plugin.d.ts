import { AvocadoPluginConfig, PluginCallback } from './definitions';
/**
 * Base class for all 3rd party plugins.
 */
export declare class Plugin {
    private avocado;
    private browserPlugin;
    isNative: boolean;
    constructor();
    send(method: string): Promise<any>;
    send(method: string, callback: PluginCallback): void;
    send(method: string, callback: Function): void;
    send(method: string, options?: any): Promise<any>;
    send(method: string, options: any, callback: PluginCallback): void;
    send(method: string, options: any, callback: Function): void;
    /**
     * Call a native plugin method, or a web API fallback.
     *
     * NO CONSOLE LOGS IN THIS METHOD! Can throw our
     * custom console handler into an infinite loop
     */
    private toPlugin(methodName, options, callbackType, callbackFunction?);
}
/**
 * Decorator for AvocadoPlugin's
 */
export declare function AvocadoPlugin(config: AvocadoPluginConfig): (cls: any) => any;
