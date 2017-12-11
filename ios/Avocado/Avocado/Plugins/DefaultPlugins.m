#import <Foundation/Foundation.h>

#import "PluginBridge.h"

/*JS_PLUGIN("com.avocadojs.plugin.browser", Browser) {
JS_METHOD("open", "url:string", JS_PROMISE)
}*/
               
//@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.browser", Browser)
//@end

AVC_PLUGIN("com.avocadojs.plugin.browser", Browser,
  AVC_PLUGIN_METHOD(open, "url:string", AVC_JS_PROMISE);
)

/*
@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.camera", Camera)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.clipboard", Clipboard)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.console", Console)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.device", Device)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.filesystem", Filesystem)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.geolocation", Geolocation)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.haptics", Haptics)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.localnotifications", LocalNotifications)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.modals", Modals)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.motion", Motion)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.network", Network)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.splashscreen", SplashScreen)
@end

@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.statusbar", StatusBar)
@end
*/
