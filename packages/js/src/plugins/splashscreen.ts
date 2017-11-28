import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'SplashScreen',
  id: 'com.avocadojs.plugin.splashscreen'
})
export class SplashScreen extends Plugin {

  show(options: {}, callback) {
    this.send('show', options, callback);
  }

  hide(options: {}, callback) {
    this.send('hide', options, callback);
  }

}
