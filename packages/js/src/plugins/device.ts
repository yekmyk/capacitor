import { AvocadoPlugin, Plugin } from '../plugin';


export class DeviceBrowserPlugin {

  async getInfo() {
    return {
      model: navigator.userAgent,
      platform: "browser",
      uuid: "",
      version: navigator.userAgent,
      manufacturer: navigator.userAgent,
      isVirtual: false,
      serial: ""
    };
  }

}


@AvocadoPlugin({
  name: 'Device',
  id: 'com.avocadojs.plugin.device',
  browser: DeviceBrowserPlugin
})
export class Device extends Plugin {
  async getInfo() {
    return this.send('getInfo');
  }
}
