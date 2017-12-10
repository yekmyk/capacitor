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
-(instancetype)initWithNameAndTypes:(NSString *)name types:(NSString *)types {
  NSLog(@"Initializing plugin with names and types: %@ %@", name, types);
  return self;
}
@end
