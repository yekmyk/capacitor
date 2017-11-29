import {
  PluginCallback,
  PluginCaller,
  PluginCall,
  PluginResult
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
  private calls: { [key: string]: PluginCall } = {};

  private callbackIdCount = 0;

  constructor() {
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

    // Load console plugin first to avoid race conditions
    setTimeout(() => { this.loadCoreModules(); } );
  }

  private log(...args: any[]) {
    args.unshift('Avocado: ');
    this.console && this.console.windowLog(args);
  }

  private loadCoreModules() {
    // this.console = new Console();
  }

  /**
   * Send a plugin method call to the native layer.
   *
   * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
   */
  toNative(call: PluginCall) {
    if (this.isNative) {
      // create a unique id for this callback
      call.callbackId = call.pluginId + ++this.callbackIdCount;

      // always send at least an empty obj
      call.options = call.options || {};

      // store the call for later lookup
      this.calls[call.callbackId] = call;

      // post the call data to native
      this.postToNative(call);

    } else {
      console.warn(`browser implementation unavailable for: ${call.pluginId}`);
    }
  }

  /**
   * Process a response from the native layer.
   */
  fromNative(result: PluginResult) {
    // get the stored call
    const storedCall = this.calls[result.callbackId];

    if (!storedCall) {
      // oopps, this shouldn't happen, something's up
      console.error(`stored callback not found: ${result.callbackId}`);

    } else if (typeof storedCall.callbackFunction === 'function') {
      // callback
      // if nativeCallback was used, but wasn't passed a callback function
      // then this gets skipped over, which is good
      // do not remove this call from stored calls cuz it could be used again
      if (result.success) {
        storedCall.callbackFunction(null, result.data);
      } else {
        storedCall.callbackFunction(result.error, null);
      }

    } else if (typeof storedCall.callbackResolve === 'function') {
      // promise
      // promises will always resolve and reject functions
      if (result.success) {
        storedCall.callbackResolve(result.data);
      } else {
        storedCall.callbackReject(result.error);
      }

      // no need to keep this call around for a one time resolve promise
      delete this.calls[result.callbackId];

    } else {
      if (!result.success && result.error) {
        // no callback, so if there was an error let's log it
        console.error(result.error.message);
      }

      // no need to keep this call around if there is no callback
      delete this.calls[result.callbackId];
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  }

  /**
   * @return the instance of Avocado
   */
  static instance() {
    if ((window as any).avocado) {
      return (window as any).avocado;
    }
    return (window as any).avocado = new Avocado();
  }
}
