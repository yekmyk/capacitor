import { AvocadoPlugin, Plugin } from '../plugin';

export enum HapticsImpactStyle {
  Heavy = 'HEAVY',
  Medium = 'MEDIUM',
  Light = 'LIGHT'
}

@AvocadoPlugin({
  name: 'Haptics',
  id: 'com.avocadojs.plugin.haptics'
})
export class Haptics extends Plugin {

  impact(options: { style: HapticsImpactStyle }) {
    this.send('impact', options);
  }

  vibrate() {
    this.send('vibrate');
  }

  selectionStart() {
    this.send('selectionStart');
  }

  selectionChanged() {
    this.send('selectionChanged');
  }

  selectionEnd() {
    this.send('selectionEnd');
  }
}
