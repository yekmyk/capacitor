
export interface PluginResultData {
  [key: string]: any;
}

export interface PluginResultError {
  message: string;
}

export type PluginCallback = (error: PluginResultError, data: PluginResultData) => void;

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

export interface PluginConfig {
  id: string;
  name: string;
}
