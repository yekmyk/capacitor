import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Motion',
  id: 'com.avocadojs.plugin.motion'
})
export class Motion extends Plugin {

  watchAccel(callback) {
    this.nativeCallback('watchAccel', callback);
  }

}
