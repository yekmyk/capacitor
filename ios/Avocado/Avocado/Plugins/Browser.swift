import Foundation
import SafariServices

@objc(Browser)
public class Browser : AVCPlugin, SFSafariViewControllerDelegate {
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
  
  @objc(open:)
  func open(url: String) {
    let url = URL(string: url)
    //let locationString = location ?? "BLANK"
    //print("GOT LOCATION", locationString)
    vc = SFSafariViewController.init(url: url!)
    vc!.delegate = self
    bridge.viewController.present(vc!, animated: true, completion: {
      //success(nil)
    })
  }
}

