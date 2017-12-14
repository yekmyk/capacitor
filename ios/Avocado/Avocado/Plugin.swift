public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = AVCPluginCall

/**
 * Base class for all plugins.
 *
 * Extends NSObject to allow for calling methods with selectors
 */

open class Plugin : AVCPlugin {
  
  //var eventListeners = [String:[PluginEventListener]]()

  public required override init(bridge: Bridge, pluginId: String) {
    super.init(bridge: bridge, pluginId: pluginId)
  }

  /*
  public func addEventListener(_ eventName: String, _ listener: PluginEventListener) {
    if var listenersForEvent = eventListeners[eventName] {
      listenersForEvent.append(listener)
    } else {
      eventListeners[eventName] = [listener]
    }
  }
  
  public func removeEventListener(_ eventName: String, _ listener: PluginEventListener) {
    if var listenersForEvent = eventListeners[eventName] {
      if let index = listenersForEvent.index(of: listener) {
        listenersForEvent.remove(at: index)
      }
    }
  }
  
  public func notifyListeners(_ eventName: String, data: PluginResultData) {
    if let listenersForEvent = eventListeners[eventName] {
      for listener in listenersForEvent {
        print("Notifying listener for event", eventName, listener, data)
        listener.success(data)
      }
    }
  }
 */
}

/**
 * A call down to a native plugin
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

