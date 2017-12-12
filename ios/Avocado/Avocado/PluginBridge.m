#import <foundation/foundation.h>
#import <Avocado/Avocado-Swift.h>

#import "PluginBridge.h"

static NSMutableArray<Class> *AvocadoPluginClasses;
NSArray<Class> *AvocadoGetPluginClasses(void)
{
  return AvocadoPluginClasses;
}

void AvocadoRegisterPlugin(Class);
void AvocadoRegisterPlugin(Class PluginClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    AvocadoPluginClasses = [NSMutableArray new];
  });

  // TODO: Make sure the class conforms to the protocol
  NSLog(@"Registering Plugin %@", PluginClass);
  // Register Plugin
  [AvocadoPluginClasses addObject:PluginClass];
}


@implementation AVCPluginMethod

-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types returnType:(AVCPluginReturnType *)returnType {
  self.name = name;
  self.types = types;
  self.returnType = returnType;
  self.params = [self makeParams];
  self.selector = [self makeSelector];
  
  return self;
}

-(NSArray *)makeParams {
  NSMutableArray *parts = [[NSMutableArray alloc] init];
  NSArray *typeParts = [self.types componentsSeparatedByString:@","];
  for(NSString *t in typeParts) {
    NSString *paramPart = [t stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
    NSArray *paramParts = [paramPart componentsSeparatedByString:@":"];
    NSMutableString *paramName = [[NSMutableString alloc] initWithString:[paramParts objectAtIndex:0]];
    [parts addObject:paramName];
  }
  return parts;
}

/**
 * Make an objective-c selector for the given plugin method.
 */
-(SEL)makeSelector {
  NSMutableString *nameSelector = [[NSMutableString alloc] initWithString:self.name];
  [nameSelector appendString:@":"];
  NSMutableArray *selectorParts = [[NSMutableArray alloc] initWithObjects:nameSelector, nil];
  NSArray *typeParts = [self.types componentsSeparatedByString:@","];
  
  // We skip the first param because Objective-C selectors don't use the first argument
  // as part of the selector. Example: method setName with arg "name:string" becomes just setName:
  if([typeParts count] > 1) {
    NSArray *typePartsMinusFirstArg = [typeParts subarrayWithRange:NSMakeRange(1, [typeParts count])];
    for(NSString *t in typePartsMinusFirstArg) {
      NSString *paramPart = [t stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
      NSArray *paramParts = [paramPart componentsSeparatedByString:@":"];
      NSMutableString *paramName = [[NSMutableString alloc] initWithString:[paramParts objectAtIndex:0]];
      [paramName appendString:@":"];
      [selectorParts addObject:paramName];
    }
  }
  // Add our required success/error callback handlers
  [selectorParts addObject:@"success:error:"];
  NSString *selectorString = [selectorParts componentsJoinedByString:@""];
  return NSSelectorFromString(selectorString);
}

-(SEL)getSelector {
  return self.selector;
}

-(void)invoke:(AVCPluginCall *)pluginCall {
  NSMutableArray *args = [[NSMutableArray alloc] initWithCapacity:[pluginCall.options count]];
  NSDictionary *options = pluginCall.options;
  for(NSString *param in self.params) {
    id arg = [options objectForKey:param];
    NSLog(@"Found param arg %@ %@", param, arg);
  }
}
@end
