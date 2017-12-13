#import "AVCPluginCall.h"
#import "AVCPlugin.h"

typedef enum {
  AVCPluginMethodArgumentNotNullable,
  AVCPluginMethodArgumentNullable
} AVCPluginMethodArgumentNullability;

typedef NSString AVCPluginReturnType;
typedef void (^AVCSuccessCallback)(id result);
typedef void (^AVCErrorCallback)(NSError *error);

@interface AVCPluginMethodArgument : NSObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) NSString *type;
@property (nonatomic, assign) AVCPluginMethodArgumentNullability nullability;

- (instancetype)initWithName:(NSString *)name nullability:(AVCPluginMethodArgumentNullability)nullability type:(NSString *)type;

@end

@interface AVCPluginMethod : NSObject

@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) NSString *types;
@property (nonatomic, strong) NSArray<AVCPluginMethodArgument *> *params;
@property (nonatomic, strong) AVCPluginReturnType *returnType;
@property (nonatomic, assign) SEL selector;

- (instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types returnType:(AVCPluginReturnType *)returnType;

- (SEL)getSelector;
- (void)invoke:(AVCPluginCall *)pluginCall onPlugin:(AVCPlugin *)plugin;

@end
