import Foundation
import SafariServices

@objc(CAPBrowserPlugin)
public class CAPBrowserPlugin : CAPPlugin, SFSafariViewControllerDelegate {
  var vc: SFSafariViewController?
  
  @objc func open(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      call.error("Must provide a URL to open")
      return
    }

    if urlString.isEmpty {
      call.error("URL must not be empty")
      return
    }

    let toolbarColor = call.getString("toolbarColor")
    let url = URL(string: urlString)
    
    DispatchQueue.main.async {
      self.vc = SFSafariViewController.init(url: url!)
      self.vc!.delegate = self
      let presentationStyle = call.getString("presentationStyle")
      if presentationStyle != nil && presentationStyle == "popover" {
        self.vc!.modalPresentationStyle = .popover
        self.setCenteredPopover(self.vc)
      } else {
        self.vc!.modalPresentationStyle = .fullScreen
      }

      if toolbarColor != nil {
        self.vc!.preferredBarTintColor = UIColor(fromHex: toolbarColor!)
      }

      self.bridge.viewController.present(self.vc!, animated: true, completion: {
        call.success()
      })
    }
  }
  
  @objc func close(_ call: CAPPluginCall) {
    if vc == nil {
      call.success()
    }
    DispatchQueue.main.async {
      self.bridge.viewController.dismiss(animated: true) {
        call.success()
      }
    }
  }
  
  @objc func prefetch(_ call: CAPPluginCall) {
    call.unimplemented()
  }
  
  public func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
    self.notifyListeners("browserFinished", data: [:])
  }
  
  public func safariViewController(_ controller: SFSafariViewController, didCompleteInitialLoad didLoadSuccessfully: Bool) {
    self.notifyListeners("browserPageLoaded", data: [:])
  }
}

