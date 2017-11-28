import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Motion',
  id: 'com.avocadojs.plugin.motion'
})
export class Motion extends Plugin {

  watchAccel(callback) {
    this.nativeCallback('watchAccel', callback);
  }

}
