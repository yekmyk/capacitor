import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Browser',
  id: 'com.avocadojs.plugin.browser'
})
export class Browser extends Plugin {

  open(url: string) {
    if (this.isNative) {
      return this.send('open', { url });
    }

    window.open(url);
  }

}
