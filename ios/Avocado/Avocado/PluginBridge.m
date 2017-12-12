#import <foundation/foundation.h>

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
  for(NSString *t in typeParts) {
    NSString *paramPart = [t stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
    NSArray *paramParts = [paramPart componentsSeparatedByString:@":"];
    NSMutableString *paramName = [[NSMutableString alloc] initWithString:[paramParts objectAtIndex:0]];
    [paramName appendString:@":"];
    [selectorParts addObject:paramName];
  }
  NSString *selectorString = [selectorParts componentsJoinedByString:@""];
  return NSSelectorFromString(selectorString);
}

-(SEL)getSelector {
  return self.selector;
}
@end
