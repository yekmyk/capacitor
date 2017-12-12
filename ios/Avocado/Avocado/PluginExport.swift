public class PluginExport {
  /**
   * Export the JS required to implement the given plugin.
   */
  public static func exportJS(webView: WKWebView, pluginClassName: String, pluginType: AVCPlugin.Type) {
    var lines = [String]()
    
    lines.append("""
      (function(w) {
      w.Avocado = w.Avocado || {};
      w.Avocado.Plugins = w.Avocado.Plugins || {};
      var a = w.Avocado; var p = a.Plugins;
      p['\(pluginClassName)'] = {}
      """)
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    let methods = bridgeType.pluginMethods() as! [AVCPluginMethod]
    print("Plugin has methods", methods);
    for method in methods {
      print("METHOD", method.name, method.types)
      lines.append(generateMethod(pluginClassName: pluginClassName, method: method))
    }
    
    lines.append("""
    })(window);
    """)
    
    let js = lines.joined(separator: "\n")
    print(js)
    
    webView.evaluateJavaScript(js) { (result, error) in
      print("EVALED", result, error)
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  private static func generateMethod(pluginClassName: String, method: AVCPluginMethod) -> String {
    let methodName = method.name!
    let returnType = method.returnType!
    let params = method.params as! [String]
    let paramString = params.joined(separator: ", ")
    var lines = [String]()
    lines.append("""
    p['\(pluginClassName)']['\(method.name!)'] = function(\(paramString)) {
    """)
    if returnType == AVCPluginReturnPromise {
      lines.append("""
        return window.Avocado.nativePromise('\(pluginClassName)', '\(methodName)', {});
      """)
    } else if returnType == AVCPluginReturnCallback {
      lines.append("""
        return window.Avocado.nativeCallback('\(pluginClassName)', '\(methodName)', {});
        """)
    } else {
      print("Error: plugin method return type \(returnType) is not supported!")
    }
    lines.append("}")
    return lines.joined(separator: "\n")
  }
}
