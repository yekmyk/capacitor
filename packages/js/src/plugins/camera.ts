import { AvocadoPlugin, Plugin } from '../plugin';


@AvocadoPlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {

  getPhoto(options: CameraOptions) {
    return this.send('getPhoto', options);
  }

}


export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
}
