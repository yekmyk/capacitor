import { AvocadoPluginConfig, PluginCallback } from './definitions';
/**
 * Base class for all 3rd party plugins.
 */
export declare class Plugin {
    private avocado;
    isNative: boolean;
    constructor();
    nativeCallback(methodName: string, callback?: PluginCallback): void;
    nativeCallback(methodName: string, callback?: Function): void;
    nativeCallback(methodName: string, options?: any): void;
    nativeCallback(methodName: string, options?: any, callback?: PluginCallback): void;
    nativeCallback(methodName: string, options?: any, callback?: Function): void;
    nativePromise(methodName: string, options?: any): Promise<any>;
    pluginId(): string;
}
/**
 * Decorator for AvocadoPlugin's
 */
export declare function NativePlugin(config: AvocadoPluginConfig): (cls: any) => any;
