import {
  Avocado,
  PluginCall,
  StoredCallbacks,
  WindowAvocado
} from './definitions';

declare var global: any;


(function(win: WindowAvocado) {
  if (win.avocado) {
    return;
  }

  // incase "win" is actually "global" and the plugins are looking for "window"
  win.window = win;

  // keep a collection of callbacks for native response data
  const calls: StoredCallbacks = {};

  // keep a counter of callback ids
  let callbackIdCount = 0;

  // get the original window.console for use later
  const browserConsole = win.console;

  // create global
  const avocado: Avocado = win.avocado = {
    isNative: false,
    platform: 'browser'
  };

  let postToNative: (call: PluginCall) => void;
  if (win.androidBridge) {
    // android platform
    postToNative = function androidBridge(data) {
      win.androidBridge.postMessage(JSON.stringify(data));
    };
    avocado.isNative = true;
    avocado.platform = 'android';

  } else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
    // ios platform
    postToNative = function iosBridge(data: any) {
      data.type = 'message';
      win.webkit.messageHandlers.bridge.postMessage(data);
    };
    avocado.isNative = true;
    avocado.platform = 'ios';
  }

  /**
   * Send a plugin method call to the native layer
   */
  avocado.toNative = function toNative(pluginId, methodName, options, storedCallback) {
    if (avocado.isNative) {
      let callbackId = '-1';

      if (storedCallback && typeof storedCallback.callback === 'function' || typeof storedCallback.resolve === 'function') {
        // store the call for later lookup
        callbackId = ++callbackIdCount + '';
        calls[callbackId] = storedCallback;
      }

      // post the call data to native
      postToNative({
        callbackId,
        pluginId,
        methodName,
        options: options || {}
      });

    } else {
      browserConsole.warn.call(browserConsole, `browser implementation unavailable for: ${pluginId}`);
    }
  };

  /**
   * Process a response from the native layer.
   */
  avocado.fromNative = function fromNative(result) {
    // get the stored call, if it exists
    const storedCall = calls[result.callbackId];

    if (storedCall) {
      // looks like we've got a stored call

      if (typeof storedCall.callback === 'function') {
        // callback
        if (result.success) {
          storedCall.callback(null, result.data);
        } else {
          storedCall.callback(result.error, null);
        }

      } else if (typeof storedCall.resolve === 'function') {
        // promise
        if (result.success) {
          storedCall.resolve(result.data);
        } else {
          storedCall.reject(result.error);
        }

        // no need to keep this stored callback
        // around for a one time resolve promise
        delete calls[result.callbackId];
      }

    } else if (!result.success && result.error) {
      // no stored callback, but if there was an error let's log it
      browserConsole.error.call(browserConsole, result.error);
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  };


  if (avocado.isNative) {
    // override window.console so we can also send logs to native
    ['log', 'error', 'debug', 'warn', 'info'].forEach(level => {
      win.console[level] = function() {
        const msgs: string[] = Array.prototype.slice.call(arguments);

        // console log to browser
        browserConsole[level].apply(browserConsole, msgs);

        // send log to native to print
        avocado.toNative('com.avocadojs.plugin.console', 'log', {
          level,
          message: msgs.join(' ')
        });
      };
    });
  }

})((typeof window !== 'undefined' ? window : global) as any);
