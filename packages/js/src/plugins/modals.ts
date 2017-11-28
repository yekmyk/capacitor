import { AvocadoPlugin, Plugin } from '../plugin';

@AvocadoPlugin({
  name: 'Modals',
  id: 'com.avocadojs.plugin.modals'
})
export class Modals extends Plugin {

  alert(title: string, message: string, buttonTitle: string) {
    return this.send('alert', {
      title,
      message,
      buttonTitle
    });
  }

  prompt(title: string, message: string, buttonTitle: string) {
    this.send('prompt', {
      title,
      message,
      buttonTitle
    });
  }

  confirm(title: string, message: string, buttonTitle: string) {
    this.send('confirm', {
      title,
      message,
      buttonTitle
    });
  }

}
