import { User } from '@entity/auth/User';
import { Campaign, Perimeter } from '@root/entity';
import mixpanel from "./mixpanel";
import { mixpanelSetUser } from './mixpanelSetUser';

class Analytics{
    private eventName: string;

    constructor(eventName: string){
        this.eventName = eventName;
    }

    async pushAnalytic(user: User | undefined, {
      distinct_id,
      company,
      campaign,
      perimeter
    }: {
      distinct_id: string | undefined;
      company: string | undefined;
      campaign?: string | undefined;
      perimeter?: string | undefined;
    }) {
        try {
          // set event track in mixpanel 
            mixpanel.track(this.eventName, {
              distinct_id,
              company,
              campaign,
              perimeter
            });
            mixpanelSetUser(user);
          } catch (error) {
            console.error("Tracking not succeeded")
          }
    }

    async addAnalytic(user: User | undefined, campaign?: Campaign, perimeter?: Perimeter){
      
      let eventToPush: {
        distinct_id: string | undefined;
        company: string | undefined;
        campaign?: string | undefined;
        perimeter?: string | undefined;
      } = {
        distinct_id: user?.email,
        company: user?.company.name,
        campaign: campaign?.name,
        perimeter: perimeter?.name
      };

      this.pushAnalytic(user, eventToPush);
    }
}

export default Analytics;