import { AvocadoPlugin, Plugin } from '../plugin';


export class GeolocationBrowserPlugin {

  getCurrentPosition() {
    console.log('Geolocation calling web fallback');

    if (navigator.geolocation) {
      return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position.coords);
        });
      });
    }

    return Promise.reject({
      err: new Error('Geolocation is not supported by this browser.')
    });
  }

}


@AvocadoPlugin({
  name: 'Geolocation',
  id: 'com.avocadojs.plugin.geolocation',
  browser: GeolocationBrowserPlugin
})
export class Geolocation extends Plugin {

  async getCurrentPosition() {
    return this.send('getCurrentPosition');
  }

  watchPosition(callback: Function) {
    this.send('watchPosition', callback);
  }

}
