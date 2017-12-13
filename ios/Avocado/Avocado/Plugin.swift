

/**
 * Base class for all plugins.
 *
 * Extends NSObject to allow for calling methods with selectors
 */
/*
@objc open class Plugin : AVCPlugin {
  
  //var eventListeners = [String:[PluginEventListener]]()

  public required override init(bridge: Bridge, pluginId: String) {
    super.init(bridge: bridge, pluginId: pluginId)
  }

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
}*/



