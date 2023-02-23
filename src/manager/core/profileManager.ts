import { Profile } from "@entity/index";
import AbstractManager from "@manager/AbstractManager";

class ProfileManager extends AbstractManager<Profile> {
  protected entityClass = Profile;

  async createNew(
    profileInfo: { firstName: string; lastName: string },
    flush: boolean = false
  ): Promise<Profile> {

    const profile = this.instance();
    profile.firstName = profileInfo.firstName;
    profile.lastName = profileInfo.lastName;

    if (flush) {
      await this.em.save(profile);
    }

    return profile;
  }

  async update(
    profile: Profile,
    profileInfo: { firstName: string; lastName: string },
    flush: boolean = false
  ): Promise<Profile> {

    this.em.merge(Profile, profile, {
      ...profileInfo,
    });

    if (flush) {
      await this.em.save(profile);
    }

    return profile;
  }
}

export default new ProfileManager();
