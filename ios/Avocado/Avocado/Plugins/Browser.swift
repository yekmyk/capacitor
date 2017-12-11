import Foundation
import SafariServices

@objc(Browser)
public class Browser : Plugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  /*
  @objc func open(_ call: PluginCall) {
    if let urlString = call.options["url"] as? String {
      let url = URL(string: urlString)
      vc = SFSafariViewController.init(url: url!)
      vc!.delegate = self
      bridge.viewController.present(vc!, animated: true, completion: {
        
      })
    }
  }
 */
  
  @objc func open(url: String, success: @escaping ACVSuccessCallback, error: ACVErrorCallback) {
    let url = URL(string: url)
    vc = SFSafariViewController.init(url: url!)
    vc!.delegate = self
    bridge.viewController.present(vc!, animated: true, completion: {
      success(NSNull())
    })
  }
}

