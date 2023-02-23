import { Site, Perimeter, User } from "@entity/index";
import AbstractManagerWithRepository from "@manager/AbstractManagerWithRepository";
import { validateSite } from "@root/controller/core/helpers/validateSite";
import { SiteRepository } from "@root/repository/index";

class SiteManager extends AbstractManagerWithRepository<Site, SiteRepository> {
  protected entityClass = Site;
  protected repositoryClass = SiteRepository;

  private async manageSiteResponse(
    siteInfo: { name: string; description: string | null; perimeter?: Perimeter; parentSiteId: number | null, oldParentId?: number | null },
    parentSite: Site | null | undefined,
    site: Site,
    type: string
  ): Promise<Site> {
    if(siteInfo.parentSiteId !== null && parentSite && parentSite !== undefined){
      await this.getRepository().deleteTreeRelationForChild(site.id, site.id);
      if(type === "create"){
        await this.getRepository().insertTreeRelationForChild(siteInfo.parentSiteId, site.id);
      }else if(type === "update"){
        await this.getRepository().updateTreeRelationForChild(siteInfo.parentSiteId, site.id);
      }

      const subSites = await this.getRepository().findSubSites(parentSite);

      subSites.push(site);

      return {
        ...parentSite,
        subSites: subSites
      }
    }

    await this.getRepository().deleteTreeRelationForChild(site.id, site.id);

    const siteResponse = await this.em.findByIds(Site, [site.id]);

    const subSites = await this.getRepository().findSubSites(siteResponse[0]);

    return {
      ...siteResponse[0],
      subSites: subSites
    };
  }

  async createNew(
    siteInfo: { name: string; description: string | null; perimeter: Perimeter, parentSiteId: number | null},
    flush: boolean = false,
  ): Promise<Site> {
    const site = this.instance();
    site.perimeter = siteInfo.perimeter;
    site.name = siteInfo.name;
    if (siteInfo.description) {
      site.description = siteInfo.description;
    }

    let parentSite = null;
    if(siteInfo.parentSiteId !== null){
      parentSite = await this.em.findOne(Site, siteInfo.parentSiteId);
    }

    if(siteInfo.parentSiteId !== null && parentSite && parentSite !== undefined){
      site.siteParent = parentSite;
    }

    if (flush) {
      await this.em.save(site);
    }

    return this.manageSiteResponse(siteInfo, parentSite, site, "create");
    
  }

  async update(
    site: Site,
    siteInfo: { name: string; description: string | null, parentSiteId: number | null },
    flush: boolean = false
  ): Promise<Site> {

    let parentSite = null;
    if(siteInfo.parentSiteId !== null){
      parentSite = await this.em.findOne(Site, siteInfo.parentSiteId);
    }
    this.em.merge(Site, site, {
      ...siteInfo,
    });

    if(siteInfo.parentSiteId !== null && parentSite && parentSite !== undefined){
      site.siteParent = parentSite;
    }

    if (flush) {
      await this.em.save(site);
    }

    return this.manageSiteResponse(siteInfo, parentSite, site, "update");
  }

  async archive(
    site: Site,
    flush: boolean = false
  ): Promise<Site> {
    this.em.merge(Site, site, {
      archivedDate: new Date(),
    });

    const subSites = await this.getRepository().findSubSites(site);

    subSites.forEach(async subSite => {
      this.em.merge(Site, subSite, {
        archivedDate: new Date(),
      });
      await this.em.save(subSite);
    });

    if (flush) {
      await this.em.save(site);
    }

    return site;
  }

  async archiveMultiple(listIds: number[], user: User){
   await Promise.all(listIds.map(async id => {
      const site = await validateSite(id, user!);
      await this.archive(site, true);
      return site;
    }));
  }

  async unarchive(
    site: Site,
    flush: boolean = false
  ): Promise<Site> {
    this.em.merge(Site, site, {
      archivedDate: null,
    });

    const subSites = await this.getRepository().findSubSites(site);

    subSites.forEach(async subSite => {
      this.em.merge(Site, subSite, {
        archivedDate: null,
      });
      await this.em.save(subSite);
    });

    if (flush) {
      await this.em.save(site);
    }

    return site;
  }
}

export default new SiteManager();
