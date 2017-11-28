import { AvocadoPlugin, Plugin } from '../plugin';
import { PluginCallback } from '../definitions';

@AvocadoPlugin({
  name: 'Geolocation',
  id: 'com.avocadojs.plugin.geolocation'
})
export class Geolocation extends Plugin {

  getCurrentPosition() {
    if (this.isNative) {
      return this.nativePromise('getCurrentPosition');
    }

    if (navigator.geolocation) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position.coords);
        });
      });
    }

    return Promise.reject({
      err: new Error(`Geolocation is not supported by this browser.`)
    });
  }

  watchPosition(callback: PluginCallback) {
    if (this.isNative) {
      this.nativeCallback('watchPosition', callback);

    } else if (navigator.geolocation) {
      const successCallback = (position: Position) => {
        callback(null, position.coords);
      }
      const errorCallback = (error: PositionError) => {
        callback(error, null);
      }
      navigator.geolocation.watchPosition(successCallback, errorCallback);

    } else {
      console.warn(`Geolocation is not supported by this browser.`);
    }
  }

}
