import { AvocadoPluginConfig, PluginCallback } from './definitions';
/**
 * Base class for all 3rd party plugins.
 */
export declare class Plugin {
    private avocado;
    isNative: boolean;
    constructor();
    nativeCallback(methodName: string, callback?: PluginCallback): any;
    nativeCallback(methodName: string, callback?: Function): any;
    nativeCallback(methodName: string, options?: any): any;
    nativeCallback(methodName: string, options?: any, callback?: PluginCallback): any;
    nativeCallback(methodName: string, options?: any, callback?: Function): any;
    nativePromise(methodName: string, options?: any): Promise<{}>;
    pluginId(): string;
}
/**
 * Decorator for AvocadoPlugin's
 */
export declare function NativePlugin(config: AvocadoPluginConfig): (cls: any) => any;
