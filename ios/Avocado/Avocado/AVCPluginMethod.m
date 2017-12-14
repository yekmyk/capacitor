#import <Avocado/Avocado-Swift.h>
#import "AVCPluginMethod.h"

typedef void(^AVCCallback)(id _arg, NSInteger index);

@implementation AVCPluginMethodArgument

- (instancetype)initWithName:(NSString *)name nullability:(AVCPluginMethodArgumentNullability)nullability type:(NSString *)type {
  if(self = [super init]) {
    _name = [name copy];
    _type = [type copy];
    _nullability = nullability;
  }
  //self.name = name;
  //self.type = type;
  //self.nullability = nullability;
  return self;
}

@end

@implementation AVCPluginMethod {
  // NSInvocation's retainArguments doesn't work with our arguments
  // so we have to retain args manually
  NSMutableArray *_manualRetainArgs;
  // Retain invocation instance
  NSInvocation *_invocation;
  NSMutableArray *_methodArgumentCallbacks;
  SEL _selector;
}

-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types returnType:(AVCPluginReturnType *)returnType {
  self.name = name;
  self.types = types;
  self.returnType = returnType;
  self.args = [self makeArgs];
  
  //self.selector = [self makeSelector];
  _selector = [self makeSelector];
  
  [self prepareCall];
  
  return self;
}

-(NSArray<AVCPluginMethodArgument *> *)makeArgs {
  NSMutableArray<AVCPluginMethodArgument *> *parts = [[NSMutableArray alloc] init];
  NSArray *typeParts = [self.types componentsSeparatedByString:@","];
  for(NSString *t in typeParts) {
    NSString *paramPart = [t stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
    NSArray *paramParts = [paramPart componentsSeparatedByString:@":"];
    NSString *paramName = [[NSString alloc] initWithString:[paramParts objectAtIndex:0]];
    NSString *typeName = [[NSString alloc] initWithString:[paramParts objectAtIndex:1]];
    NSString *flag = [paramName substringFromIndex:MAX([paramName length] - 1, 0)];
    AVCPluginMethodArgumentNullability nullability = AVCPluginMethodArgumentNotNullable;
    if([flag isEqualToString:@"?"]) {
      nullability = AVCPluginMethodArgumentNullable;
      paramName = [paramName substringWithRange:NSMakeRange(0, [paramName length] - 1)];
    }
    AVCPluginMethodArgument *arg = [[AVCPluginMethodArgument alloc] initWithName:paramName nullability:nullability type:typeName];
    [parts addObject:arg];
  }
  return parts;
}

/**
 * Make an objective-c selector for the given plugin method.
 */
-(SEL)makeSelector {
  // Name of method must be the first part of the selector
  NSMutableString *nameSelector = [[NSMutableString alloc] initWithString:self.name];
  [nameSelector appendString:@":"];
  
  // Building up our selector here, starting with the name part
  NSMutableArray *selectorParts = [[NSMutableArray alloc] initWithObjects:nameSelector, nil];
  
  // Skip the first argument because its not part of the selector
  if([self.args count] > 1) {
    NSArray<AVCPluginMethodArgument *> *argsMinusFirst = [self.args subarrayWithRange:NSMakeRange(1, [self.args count]-1)];
    for(AVCPluginMethodArgument *arg in argsMinusFirst) {
      NSMutableString *paramName = [[NSMutableString alloc] initWithString:arg.name];
      [paramName appendString:@":"];
      [selectorParts addObject:paramName];
    }
  }
  
  // Add our required success/error callback handlers
  [selectorParts addObject:@"success:"];//error:"];
  NSString *selectorString = [selectorParts componentsJoinedByString:@""];
  return NSSelectorFromString(selectorString);
}


-(SEL)getSelector {
  return _selector;
}

-(void)prepareCall {
  // Get all our possible arguments and build up blocks to easily retain
  // arguments for calls
  
  // TODO: Cache this once and repeat calls
  _methodArgumentCallbacks = [NSMutableArray arrayWithCapacity:2];
  
  //NSMutableArray *manualRetainArgs = _manualRetainArgs;
  //NSInvocation *invocation = _invocation;
  
  NSUInteger numArgs = [self.args count];
  for(int i = 0; i < numArgs; i++) {
    AVCPluginMethodArgument *arg = [self.args objectAtIndex:i];
    id callBlock = ^(id _arg, NSInteger index) {
      [_manualRetainArgs addObject:_arg];
      [_invocation setArgument:&_arg atIndex:index];
    };
    
    [_methodArgumentCallbacks addObject:callBlock];
  }
  
  id successBlockArg = ^(__unused id _arg, NSInteger index) {
    id block = (^() {
      NSLog(@"Success callback");
      //AVCPluginCallSuccessHandler block = [pluginCall getSuccessHandler];
      //AVCPluginCallResult *result = [[AVCPluginCallResult alloc] initWithData:nil];
    });
    [_invocation setArgument:&block atIndex:index];
    [_manualRetainArgs addObject:block];
  };
  

  [_methodArgumentCallbacks addObject:successBlockArg];
}

// See https://stackoverflow.com/a/3224774/32140 for NSInvocation background
-(void)invoke:(AVCPluginCall *)pluginCall onPlugin:(AVCPlugin *)plugin {
  NSMutableArray *args = [[NSMutableArray alloc] initWithCapacity:[pluginCall.options count]];
  NSDictionary *options = pluginCall.options;

  NSMethodSignature * mySignature = [plugin methodSignatureForSelector:_selector];
  NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:mySignature];
  
  _invocation = invocation;
  [_invocation setTarget:plugin];
  [_invocation setSelector:_selector];
  
  NSUInteger numArgs = [self.args count];
  for(int i = 0; i < numArgs; i++) {
    AVCPluginMethodArgument *arg = [self.args objectAtIndex:i];
    id callArg = [options objectForKey:arg.name];
    NSLog(@"Found callArg and arg %@ %@", callArg, arg);
    
    AVCCallback block = [_methodArgumentCallbacks objectAtIndex:i];
    block(callArg, i+2);
  }
  
  AVCCallback successBlock = [_methodArgumentCallbacks objectAtIndex:numArgs];
  successBlock(nil, numArgs+2);

  CFTimeInterval start = CACurrentMediaTime();
  [_invocation invoke];
  CFTimeInterval duration = CACurrentMediaTime() - start;
  NSLog(@"Method invocation took %dms", (int)(duration * 1000));
}
@end

