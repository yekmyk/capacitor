#if defined(__cplusplus)
#define AVC_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define AVC_EXTERN extern __attribute__((visibility("default")))
#endif

#define AVCPluginReturnCallback @"callback"
#define AVCPluginReturnPromise @"promise"
#define AVCPluginReturnSync @"sync" // not used

@class AVCPluginCall;

typedef NSString AVCPluginReturnType;
typedef void (^AVCSuccessCallback)(id result);
typedef void (^AVCErrorCallback)(NSError *error);

@interface AVCPluginMethod : NSObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) NSString *types;
@property (nonatomic, strong) NSArray *params;
@property (nonatomic, strong) AVCPluginReturnType *returnType;
@property (nonatomic, assign) SEL selector;

-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types returnType:(AVCPluginReturnType *)returnType;

-(SEL)getSelector;
-(void)invoke:(AVCPluginCall *)pluginCall;

@end

@protocol AVCBridgedPlugin <NSObject>
+(NSString *)pluginId;
+(NSArray *)pluginMethods;
+(AVCPluginMethod *)getMethod:(NSString *)methodName;
@optional
@end

#define AVC_PLUGIN_CONFIG(plugin_id) \
AVC_EXTERN void AvocadoRegisterPlugin(Class); \
+ (NSString *)pluginId { return @#plugin_id; } \
+ (void)load { AvocadoRegisterPlugin(self); }
#define AVC_PLUGIN_METHOD(method_name, method_types, method_return_type) \
[methods addObject:[[AVCPluginMethod alloc] initWithNameAndTypes:@#method_name types:@method_types returnType:method_return_type]]


#define AVC_PLUGIN(objc_name, methods_body) \
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
+ (AVCPluginMethod *)getMethod:(NSString *)methodName { \
  NSArray *methods = [self pluginMethods]; \
  for(AVCPluginMethod *method in methods) { \
    if([method.name isEqualToString:methodName]) { \
      return method; \
    } \
  } \
  return nil; \
} \
AVC_PLUGIN_CONFIG(objc_name) \
@end

