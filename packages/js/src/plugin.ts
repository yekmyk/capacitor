import { Avocado } from './avocado';
import { AvocadoPluginConfig, PluginCallback } from './definitions';

/**
 * Base class for all 3rd party plugins.
 */
export class Plugin {
  avocado: Avocado;
  private browserPlugin: any;

  constructor() {
    this.avocado = Avocado.instance();
    this.avocado.registerPlugin(this);
  }

  send(method: string): Promise<any>;
  send(method: string, callback: PluginCallback): void;
  send(method: string, callback: Function): void;
  send(method: string, options?: any): Promise<any>;
  send(method: string, options: any, callback: PluginCallback): void;
  send(method: string, options: any, callback: Function): void;
  send(method: string, a?: any, b?: any) {
    if (typeof a === 'function') {
      return this.toPlugin(method, {}, 'callback', a);
    }
    if (typeof b === 'function') {
      return this.toPlugin(method, a || {}, 'callback', b);
    }

    return this.toPlugin(method, a || {}, 'promise', null);
  }

  /**
   * Call a native plugin method, or a web API fallback.
   *
   * NO CONSOLE LOGS IN THIS METHOD! Can throw our
   * custom console handler into an infinite loop
   */
  private toPlugin(methodName: any, options: any, callbackType: string, callbackFunction?: PluginCallback) {
    const config: AvocadoPluginConfig = (this as any).constructor.getPluginInfo();

    if (this.avocado.isNative) {
      return this.avocado.toNative({
        pluginId: config.id,
        methodName: methodName,
        options: options,
        callbackType: callbackType
      }, {
        callbackFunction: callbackFunction
      });
    }

    if (typeof config.browser !== 'function') {
      console.warn(`"${config.name}" browser plugin not found`);
      return Promise.resolve();
    }

    if (!this.browserPlugin) {
      this.browserPlugin = new config.browser();
    }

    if (typeof this.browserPlugin[methodName] !== 'function') {
      console.warn(`"${config.name}" browser plugin missing "${methodName}" method`);
      return Promise.resolve();
    }

    return this.browserPlugin[methodName](options, callbackFunction);
  }
}

/**
 * Decorator for AvocadoPlugin's
 */
export function AvocadoPlugin(config: AvocadoPluginConfig) {
  return function(cls: any) {
    cls['_avocadoPlugin'] = Object.assign({}, config);
    cls['getPluginInfo'] = () => cls['_avocadoPlugin'];
    return cls;
  };
}
