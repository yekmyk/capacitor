public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = AVCPluginCall

/**
 * Swift niceities for AVCPluginCall
 */
public extension AVCPluginCall {

  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  @objc public func getBool(_ key: String, defaultValue: NSNumber?) -> NSNumber? {
    return self.options[key] as? NSNumber ?? defaultValue
  }
  
  public func success() {
    successHandler(AVCPluginCallResult())
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successHandler(AVCPluginCallResult(data))
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(AVCPluginCallError(message: message, error: error, data: data))
  }
}

