#ifndef PluginBridge_h
#define PluginBridge_h


#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif

#define AVC_JS_CALLBACK "callback"
#define AVC_JS_PROMISE "promise"

typedef void (^AVCSuccessCallback)(id result);
typedef void (^AVCErrorCallback)(NSError *error);

@interface AVCPluginMethod : NSObject
@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) NSString *types;
@property (nonatomic, assign) SEL selector;

-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types;

-(SEL)getSelector;

@end

@protocol AVCBridgedPlugin <NSObject>

#define AVC_PLUGIN_CONFIG(plugin_id) \
AVC_EXTERN void AvocadoRegisterPlugin(Class); \
+ (NSString *)pluginId { return @plugin_id; } \
+ (void)load { AvocadoRegisterPlugin(self); }
+ (NSArray *)pluginMethods;
#define AVC_PLUGIN_METHOD(method_name, method_types, method_return_type) \
[methods addObject:[[AVCPluginMethod alloc] initWithNameAndTypes:@#method_name types:@method_types]]

+ (NSString *)pluginId;

@optional

#define AVC_PLUGIN(plugin_id, objc_name, methods_body) \
@interface objc_name : NSObject \
@end \
@interface objc_name (AVCPluginCategory) <AVCBridgedPlugin> \
@end \
@implementation objc_name (AVCPluginCategory) \
+ (NSArray *)pluginMethods { \
  NSMutableArray *methods = [NSMutableArray new]; \
  methods_body \
  return methods; \
} \
AVC_PLUGIN_CONFIG(plugin_id) \
@end

@end
/*
@protocol AvocadoBridgePlugin <NSObject>

#define AVOCADO_EXPORT_PLUGIN(plugin_id) \
AVC_EXTERN void AvocadoRegisterPlugin(Class); \
+ (NSString *)pluginId { return @plugin_id; } \
+ (void)load { AvocadoRegisterPlugin(self); }

+ (NSString *)pluginId;

@optional

#define AVOCADO_PLUGIN_DEFINE(plugin_id, objc_name) \
objc_name : NSObject \
@end \
@implementation objc_name \
AVOCADO_EXPORT_PLUGIN(plugin_id)

#define AVOCADO_PLUGIN(plugin_id, objc_name) \
@interface objc_name : NSObject \
@end \
@interface objc_name (AvocadoExternPlugin) <AvocadoBridgePlugin> \
@end \
@implementation objc_name (AvocadoExternPlugin) \
AVOCADO_EXPORT_PLUGIN(plugin_id) \
@end

@end
 */

#endif /* PluginBridge_h */
