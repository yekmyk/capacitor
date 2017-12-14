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
  AVCPluginCall *_call;
  SEL _selector;
}

-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types returnType:(AVCPluginReturnType *)returnType {
  self.name = name;
  self.types = types;
  self.returnType = returnType;
  self.args = [self makeArgs];
  
  _selector = [self makeSelector];

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
  
  NSString *selectorString = [selectorParts componentsJoinedByString:@""];
  return NSSelectorFromString(selectorString);
}

-(SEL)getSelector {
  return _selector;
}

@end

