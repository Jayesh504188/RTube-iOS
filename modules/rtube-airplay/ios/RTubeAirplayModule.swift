import AVKit
import ExpoModulesCore

// Native view that hosts the system AirPlay route picker.
// Rendered by the JS <AirPlayButton /> component.
public class RTubeAirplayButtonView: ExpoView {
  private let routePicker = AVRoutePickerView()

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    routePicker.activeTintColor = UIColor.systemRed
    addSubview(routePicker)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    routePicker.frame = bounds
  }
}

public class RTubeAirplayModule: Module {
  public func definition() -> ModuleDefinition {
    Name("RTubeAirplay")

    View(RTubeAirplayButtonView.self) {
      // No props - the picker manages itself.
    }
  }
}
