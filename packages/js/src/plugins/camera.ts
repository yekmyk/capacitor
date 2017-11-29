import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {

  getPhoto(options: CameraOptions) {
    return this.nativePromise('getPhoto', options);
  }

}


export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
}
