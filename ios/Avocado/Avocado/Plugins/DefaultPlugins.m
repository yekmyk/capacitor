#import <Foundation/Foundation.h>

#import "AVCBridgedPlugin.h"

/*JS_PLUGIN("com.avocadojs.plugin.browser", Browser) {
JS_METHOD("open", "url:string", JS_PROMISE)
}*/
               
//@interface AVOCADO_PLUGIN_DEFINE("com.avocadojs.plugin.browser", Browser)
//@end

AVC_PLUGIN(Browser,
           AVC_PLUGIN_METHOD(open, "url:string", AVCPluginReturnPromise);
           AVC_PLUGIN_METHOD(close, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Camera,
           AVC_PLUGIN_METHOD(getPhoto, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Clipboard,
           AVC_PLUGIN_METHOD(get, "options:any", AVCPluginReturnPromise);
           AVC_PLUGIN_METHOD(set, "options:any", AVCPluginReturnPromise);
)

AVC_PLUGIN(Console,
           AVC_PLUGIN_METHOD(log, "message:string,level?:string", AVCPluginReturnNone);
)

AVC_PLUGIN(Device,
           AVC_PLUGIN_METHOD(getInfo, "", AVCPluginReturnPromise);
)

/*
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
