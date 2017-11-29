import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'StatusBar',
  id: 'com.avocadojs.plugin.statusbar'
})
export class StatusBar extends Plugin {

  setStyle(options: { style: StatusBarStyle }, callback) {
    this.nativeCallback('setStyle', options, callback);
  }

}


export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}
