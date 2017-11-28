import { AvocadoPlugin, Plugin } from '../plugin';


@AvocadoPlugin({
  name: 'Device',
  id: 'com.avocadojs.plugin.device'
})
export class Device extends Plugin {
  getInfo() {
    if (this.isNative) {
      return this.nativePromise('getInfo');
    }

    return Promise.resolve({
      model: navigator.userAgent,
      platform: 'browser',
      uuid: '',
      version: navigator.userAgent,
      manufacturer: navigator.userAgent,
      isVirtual: false,
      serial: ''
    });
  }
}
