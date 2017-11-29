import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Network',
  id: 'com.avocadojs.plugin.network'
})
export class Network extends Plugin {

  onStatusChange(callback) {
    this.nativeCallback('onStatusChange', callback);
  }

}
