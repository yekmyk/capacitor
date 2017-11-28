import {
  PluginCallback,
  PluginCallbackHandler,
  PluginCaller,
  PluginCall,
  PluginResult,
  StoredPluginCall
} from './definitions';
import { Plugin } from './plugin';
import { Console } from './plugins/console';


/**
 * Main class for interacting with the Avocado runtime.
 */
export class Avocado {
  private console: Console;
  private postToNative: (call: PluginCall) => void;
  isNative = false;

  // Storage of calls for associating w/ native callback later
  private calls: { [key: string]: StoredPluginCall } = {}

  private callbackIdCount = 0;

  constructor() {
    // Load console plugin first to avoid race conditions
    setTimeout(() => { this.loadCoreModules(); } )

    const win: any = window;
    if (win.avocadoBridge) {
      this.postToNative = (data: any) => {
        win.avocadoBridge.postMessage(data);
      };
      this.isNative = true;

    } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
      this.postToNative = (data) => {
        win.webkit.messageHandlers.bridge.postMessage({
          type: 'message',
          ...data
        });
      };
      this.isNative = true;
    }
  }

  private log(...args: any[]) {
    args.unshift('Avocado: ');
    this.console && this.console.windowLog(args);
  }

  private loadCoreModules() {
    //this.console = new Console();
  }

  registerPlugin(plugin: Plugin) {
    let info = (<any>plugin).constructor.getPluginInfo();
    this.log('Registering plugin', info);
  }

  /**
   * Send a plugin method call to the native layer.
   *
   * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
   */
  toNative(call: PluginCall, caller: PluginCaller) {
    let ret;

    let callbackId = call.pluginId + ++this.callbackIdCount;

    call.callbackId = callbackId;

    switch(call.callbackType) {
      case 'callback':
        if (typeof caller.callbackFunction !== 'function') {
          caller.callbackFunction = () => {}
        }
        this._toNativeCallback(call, caller);
        break;

      default:
        // promise
        ret = this._toNativePromise(call, caller);
    }

    this.postToNative(call);

    return ret;
  }

  private _toNativeCallback(call: PluginCall, caller: PluginCaller) {
    this._saveCallback(call, caller.callbackFunction);
  }

  private _toNativePromise(call: PluginCall, caller: PluginCaller) {
    let promiseCall: any = {};

    let promise = new Promise((resolve, reject) => {
      promiseCall['$resolve'] = resolve;
      promiseCall['$reject'] = reject;
    });

    promiseCall['$promise'] = promise;

    this._saveCallback(call, promiseCall);

    return promise;
  }

  private _saveCallback(call: PluginCall, callbackHandler: PluginCallbackHandler) {
    call.callbackId = call.callbackId;
    this.calls[call.callbackId] = {
      call,
      callbackHandler
    }
  }

  /**
   * Process a response from the native layer.
   */
  fromNative(result: PluginResult) {
    const storedCall = this.calls[result.callbackId];

    const { call, callbackHandler } = storedCall;

    this._fromNativeCallback(result, storedCall);
  }

  private _fromNativeCallback(result: PluginResult, storedCall: StoredPluginCall) {
    const { call, callbackHandler } = storedCall;

    switch(storedCall.call.callbackType) {
      case 'promise': {
        if (result.success === false) {
          callbackHandler.$reject(result.error);
        } else {
          callbackHandler.$resolve(result.data);
        }
        break;
      }
      case 'callback': {
        if(typeof callbackHandler == 'function') {
          result.success ? callbackHandler(null, result.data) : callbackHandler(result.error, null);
        }
      }
    }
  }

  /**
   * @return the instance of Avocado
   */
  static instance() {
    if((<any>window).avocado) {
      return (<any>window).avocado;
    }
    return (<any>window).avocado = new Avocado();
  }
}
