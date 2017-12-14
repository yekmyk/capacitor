#import <Foundation/Foundation.h>

#import "AVCPluginCall.h"

@implementation AVCPluginCallResult
- (instancetype)initWithData:(NSDictionary<NSString *, id>*)data {
  self.data = data;
  return self;
}
@end

@implementation AVCPluginCall
-(instancetype)initWithOptions:(NSDictionary *)options success:(AVCPluginCallSuccessHandler) success error:(AVCPluginCallErrorHandler) error {
  self.options = options;
  self.successHandler = success;
  self.errorHandler = error;
  return self;
}

- (AVCPluginCallSuccessHandler)getSuccessHandler {
  return _successHandler;
}

- (AVCPluginCallErrorHandler)getErrorHandler {
  return _errorHandler;
}

@end

/*
/**
 * A call down to a native plugin

public class AVCPluginCall : NSObject {

  
  public init(options: [String:Any], success: @escaping PluginSuccessCallback, error: @escaping PluginErrorCallback) {
    self.options = options
    self.successCallback = success
    self.errorCallback = error
  }
  
  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  public func getBool(_ key: String, defaultValue: NSNumber?) -> NSNumber? {
    return self.options[key] as? NSNumber ?? defaultValue
  }
  
  public func success() {
    successCallback(PluginResult())
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successCallback(PluginResult(data))
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorCallback(PluginCallError(message: message, error: error, data: data))
  }
  }
*/
