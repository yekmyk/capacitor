
// always import avocado so that it's placed on window
import './avocado';

export {
  PluginCallback,
  PluginResultData,
  PluginResultError,
  PluginConfig
} from './definitions';

export {
  Plugin, NativePlugin
} from './plugin';

export { Browser } from './plugins/browser';
export { Camera } from './plugins/camera';
export { Clipboard } from './plugins/clipboard';
export { Device } from './plugins/device';
export { Filesystem, FilesystemDirectory } from './plugins/fs';
export { Geolocation } from './plugins/geolocation';
export { Haptics, HapticsImpactStyle } from './plugins/haptics';
export { LocalNotifications, LocalNotification, NotificationScheduleAt } from './plugins/local-notifications';
export { Modals } from './plugins/modals';
export { Motion } from './plugins/motion';
export { Network } from './plugins/network';
export { SplashScreen } from './plugins/splashscreen';
export { StatusBar, StatusBarStyle } from './plugins/statusbar';
