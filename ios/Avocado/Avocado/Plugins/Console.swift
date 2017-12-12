import Foundation

@objc(Console)
public class Console : Plugin {

  @objc public func log(_ call: AVCPluginCall) {
    let data = call.options
    let message = data["message"] ?? ""
    let level = data["level"] ?? "LOG"
    print("[\(level)] \(self.pluginId) - \(message)")
  }
}

