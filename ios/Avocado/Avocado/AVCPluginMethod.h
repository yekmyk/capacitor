#import "AVCPluginCall.h"
#import "AVCPlugin.h"

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
-(void)invoke:(AVCPluginCall *)pluginCall onPlugin:(AVCPlugin *)plugin;

@end
