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
      if error != nil {
        print("ERROR EXPORTTING PLUGIN JS", js)
      } else if result != nil {
        print(result!)
      }
    }
  }
  
  private static func generateMethod(pluginClassName: String, method: AVCPluginMethod) -> String {
    let methodName = method.name!
    let returnType = method.returnType!
    let args = method.args!
    
    // Create a param string of the form "param1, param2, param3"
    let paramString = args.map { $0.name }.joined(separator: ", ")
  
    
    let argObjectString = generateArgObject(method: method)
    
    var lines = [String]()
    
    // Create the function declaration
    lines.append("p['\(pluginClassName)']['\(method.name!)'] = function(\(paramString)) {")
    
    // Create the call to Avocado...
    if returnType == AVCPluginReturnPromise {
      // ...using a promise
      lines.append("""
        return window.Avocado.nativePromise('\(pluginClassName)', '\(methodName)', \(argObjectString));
      """)
    } else if returnType == AVCPluginReturnCallback {
      // ...using a callback
      lines.append("""
        return window.Avocado.nativeCallback('\(pluginClassName)', '\(methodName)', \(argObjectString));
        """)
    } else {
      print("Error: plugin method return type \(returnType) is not supported!")
    }
    
    // Close the function
    lines.append("}")
    return lines.joined(separator: "\n")
  }
  
  private static func generateArgObject(method: AVCPluginMethod) -> String {
    let args = method.args!
    var lines = [String]()
    lines.append("""
    {
    """)

    for arg in args {
      lines.append("\(arg.name!): \(arg.name!),")
    }

    lines.append("}")
    return lines.joined(separator: "\n")
  }
}
