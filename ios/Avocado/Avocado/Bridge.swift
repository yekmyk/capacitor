import Foundation
import Dispatch
import WebKit

@objc public class Bridge : NSObject {
  public var webView: WKWebView?
  public var viewController: UIViewController
  
  public var lastPlugin: AVCPlugin?
  
  // Map of all loaded and instantiated plugins by pluginId -> instance
  public var plugins =  [String:AVCPlugin]()
  // List of known plugins by pluginId -> Plugin Type
  public var knownPlugins = [String:AVCPlugin.Type]()
  
  // Dispatch queue for our operations
  // TODO: Unique label?
  public var dispatchQueue = DispatchQueue(label: "bridge")
  
  public init(_ vc: UIViewController, _ pluginIds: [String]) {
    self.viewController = vc
    super.init()
    registerPlugins()
  }
  
  public func willAppear() {
    if let splash = getOrLoadPlugin(pluginId: "com.avocadojs.plugin.splashscreen") as? SplashScreen {
      splash.showOnLaunch()
    }
  }
  
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c = classes![i]
      if class_conformsToProtocol(c, AVCBridgedPlugin.self) {
        let pluginClassName = NSStringFromClass(c)
        let pluginType = c as! AVCPlugin.Type
        registerPlugin(pluginClassName, pluginType)
      }
    }
  }
  
  func registerPlugin(_ pluginClassName: String, _ pluginType: AVCPlugin.Type) {
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    let methods = bridgeType.jsMethods() as! [AVCPluginMethod]
    print("Plugin has methods", methods);
    for method in methods {
      print("METHOD", method.name, method.types)
      //let selector = method.getSelector()
      let selector = selectorFromTypeString(name: method.name, types: method.types!)
    }
    knownPlugins[bridgeType.pluginId()] = pluginType
    defineJS(pluginClassName, pluginType)
  }
  
  func selectorFromTypeString(name: String, types: String) -> Selector {
    var selectorParts = [String]()
    selectorParts.append(name + ":")
    let typeParts = types.split(separator: ",")
    for t in typeParts {
      let paramPart = t.trimmingCharacters(in: .whitespacesAndNewlines)
      let paramParts = paramPart.split(separator: ":")
      let paramName = paramParts[0]
      selectorParts.append(paramName + ":")
    }
    let selectorString = selectorParts.flatMap({$0}).joined()
    print("Made selector string", selectorString)
    return NSSelectorFromString(selectorString)
  }
  
  public func getOrLoadPlugin(pluginId: String) -> AVCPlugin? {
    guard let plugin = self.getPlugin(pluginId: pluginId) ?? self.loadPlugin(pluginId: pluginId) else {
      return nil
    }
    return plugin
  }
  
  public func getPlugin(pluginId: String) -> AVCPlugin? {
    return self.plugins[pluginId]
  }
  
  public func loadPlugin(pluginId: String) -> AVCPlugin? {
    guard let pluginType = knownPlugins[pluginId] else {
      print("Unable to load plugin \(pluginId). No such module found.")
      return nil
    }
    
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    let p = pluginType.init(bridge: self, pluginId: bridgeType.pluginId())
    p!.load()
    self.plugins[bridgeType.pluginId()] = p
    return p
  }
  
  public func defineJS(_ pluginClassName: String, _ pluginType: AVCPlugin.Type) {
    var mc: CUnsignedInt = 0
    var mlist = class_copyMethodList(pluginType, &mc)
    let olist = mlist
    print("\(mc) methods")
    
    var lines = [String]()
    
    lines.append("""
    (function(w) {
      w.Avocado = w.Avocado || {};
      w.Avocado.Plugins = w.Avocado.Plugins || {};
      var a = w.Avocado; var p = a.Plugins;
    """)
    
    for i in (0..<mc) {
      let classLine = """
      p['\(pluginClassName)'] = {}
      """
      lines.append(classLine)
      
      var sel: Selector = method_getName(mlist!.pointee)
      var selName = sel_getName(sel)
      //var sig = JSExport.getMethodSignature(sel, for: pluginType)!
      print("Method #\(i): \(sel)")
      //print("GOT SIG", sig)
      
      /*
      if sig.numberOfArguments > 2 {
        for argIndex in 2..<sig.numberOfArguments {
          let arg = sig.getArgumentType(at: argIndex)
          print("ARGUMENT TYPE", String(cString: arg))
        }
        print(String(cString: selName))
      }*/
      
      mlist = mlist!.successor()
      

      
    }
    free(olist)
    
    let js = lines.joined(separator: "\n")
    self.webView?.evaluateJavaScript(js) { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  public func isSimulator() -> Bool {
    var isSimulator = false
    #if arch(i386) || arch(x86_64)
      isSimulator = true
    #endif
    return isSimulator
  }
  
  public func isDevMode() -> Bool {
    return true
  }
  
  public func showDevMode() {
    let devMode = DevMode(self)
    devMode.show()
  }
  
  public func reload() {
    guard let webView = self.webView else {
      return
    }
    webView.reload()
  }
  
  public func modulePrint(_ plugin: Plugin, _ items: Any...) {
    let output = items.map { "\($0)" }.joined(separator: " ")
    Swift.print(plugin.pluginId, "-", output)
  }
  
  public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.viewController.present(alert, animated: true, completion: nil)
  }
  
  public func setWebView(webView: WKWebView) {
    self.webView = webView
  }

  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    let selector = NSSelectorFromString("\(call.method):")
    
    guard let plugin = self.getPlugin(pluginId: call.pluginId) ?? self.loadPlugin(pluginId: call.pluginId) else {
      print("Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
      return
    }
    
    print("Calling method \(call.method) on plugin \(plugin.getId())")
    
    if !plugin.responds(to: selector) {
      print("Error: Plugin \(plugin.getId()) does not respond to method call \(call.method).")
      print("Ensure plugin method exists and uses @objc in its declaration")
      return
    }
    
    // Create a plugin call object and handle the success/error callbacks
    dispatchQueue.sync {
      //let startTime = CFAbsoluteTimeGetCurrent()
      
      let pluginCall = PluginCall(options: call.options, success: {(result: PluginResult) -> Void in
        self.toJs(result: JSResult(call: call, result: result.data))
      }, error: {(error: PluginCallError) -> Void in
        self.toJsError(error: JSResultError(call: call, message: error.message, error: error.data))
      })
      // Perform the plugin call
      plugin.perform(selector, with: pluginCall)
      
      //let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
      //print("Native call took", timeElapsed)
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult) {
    let resultJson = result.toJson()
    print("TO JS", result.toJson())
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', success: true, data: \(resultJson)})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  /**
   * Send an error result to the JavaScript layer.
   */
  public func toJsError(error: JSResultError) {
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: \(error.toJson())})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  @objc public func evalWithPlugin(_ plugin: AVCPlugin, js: String) {
    let wrappedJs = """
    avocado.withPlugin('\(plugin.getId())', function(plugin) {
      if(!plugin) { console.error('Unable to execute JS in plugin, no such plugin found for id \(plugin.getId())'); }
      \(js)
    });
    """
    self.webView?.evaluateJavaScript(wrappedJs, completionHandler: { (result, error) in
      if error != nil {
        print("JS Eval error", error?.localizedDescription)
      }
    })
  }
}
