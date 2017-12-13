import Foundation

@objc(Console)
public class Console : AVCPlugin {

  //@objc public func log(_ call: AVCPluginCall) {
    
  @objc public func log(message: String, level: String = "LOG") {
    print("[\(level)] \(self.pluginId) - \(message)")
  }
}

