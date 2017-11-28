export declare type PluginCallback = (error: PluginResultError, data: PluginResultData) => void;
/**
 * Data that won't be sent to the native layer
 * from the caller. For example, a callback function
 * that cannot be cloned in JS
 */
export interface PluginCaller {
    callbackFunction?: PluginCallback;
}
/**
 * Metadata about a native plugin call.
 */
export interface PluginCall {
    pluginId: string;
    methodName: string;
    options: any;
    callbackId?: string;
    callbackFunction?: PluginCallback;
    callbackResolve?: Function;
    callbackReject?: Function;
}
export interface StoredPluginCall_ {
    call: PluginCall;
    callbackHandler: {
        callback?: PluginCallback;
        resolve?: Function;
        reject?: Function;
    };
}
export interface PluginResultData {
    [key: string]: any;
}
export interface PluginResultError {
    message: string;
}
/**
 * A resulting call back from the native layer.
 */
export interface PluginResult {
    callbackId?: string;
    methodName: string;
    data: PluginResultData;
    success: boolean;
    error?: PluginResultError;
}
export interface NativePostMessage {
    (call: PluginCall, caller: PluginCaller): void;
}
export interface AvocadoPluginConfig {
    id: string;
    name: string;
}
