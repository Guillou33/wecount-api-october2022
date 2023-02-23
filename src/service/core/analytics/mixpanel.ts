import MixpanelRaw from "mixpanel";
import config from "config";

const mixpanelConfig: {
  host: string | null;
  projectId: string;
  sandboxMode: boolean;
} = config.get("mixpanel");

class Mixpanel {
  private mixpanelInstance: MixpanelRaw.Mixpanel;

  constructor() {
    if (!mixpanelConfig.sandboxMode) {
      const config = mixpanelConfig.host ? {
        host: mixpanelConfig.host,
      } : {};
      this.mixpanelInstance = MixpanelRaw.init(mixpanelConfig.projectId, config);
    }
  }

  get track(): typeof MixpanelRaw.track { 
    if (mixpanelConfig.sandboxMode) {
      return (...args: any[]) => {}
    }
    return this.mixpanelInstance.track 
  }

  setPeople(distinctId: string, properties: MixpanelRaw.PropertyDict, callback?: MixpanelRaw.Callback | undefined): void { 
    if (mixpanelConfig.sandboxMode) {
      return;
    }
    return this.mixpanelInstance.people.set(distinctId, properties, callback);
  }
}

export default new Mixpanel();
