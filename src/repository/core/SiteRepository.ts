import { ActivityEntry, Perimeter, Site, UserRoleWithinPerimeter } from "@entity/index";
import { EntityRepository, getManager, Repository, TreeRepository } from "typeorm";
import { User } from "@entity/index";

export interface SitesWithSubs {
  subSites: Site[]; 
  perimeter: Perimeter; 
  id: number; 
  createdAt: Date; 
  name: string; 
  description: string | null; 
  archivedDate: Date | null; 
  siteParent: Site;
}

@EntityRepository(Site)
export class SiteRepository extends Repository<Site> {
  async insertTreeRelationForChild(parentId: number | null, childId: number){
    this.query(`
      INSERT INTO site_closure (id_ancestor, id_descendant)
      VALUES (${parentId}, ${childId})
    `);
  }

  async updateTreeRelationForChild(newParentId: number | null, childId: number){
    this.query(`
      UPDATE site_closure
      SET id_ancestor = ${newParentId}
      WHERE id_descendant = ${childId}
    `);
  }

  async deleteTreeRelationForChild(parentId: number | null, childId: number){
    this.query(`
      DELETE FROM site_closure
      WHERE id_ancestor = ${parentId} and id_descendant = ${childId}
    `);
  }

  async deleteParent(site: Site){

    const manager = getManager();
    const ancestor = await manager
      .getTreeRepository(Site)
      .findAncestors(site);

  }

  async findSubSites(site: Site, user?: User | null | undefined): Promise<Site[]>{

    const manager = getManager();
    const trees = await manager
      .getTreeRepository(Site)
      .createDescendantsQueryBuilder("s", "siteClosure", site)
      .getMany();

    return trees;
  }

  async findAllForManager(user: User): Promise<Site[]> {
    const queryBuilder = await this
      .createQueryBuilder("s")
      .innerJoin("s.perimeter", "p")
      .innerJoin("p.company", "company")
      .innerJoin(User, "u", "u.company_id = company.id AND u.id = :userId", {
        userId: user.id,
      })      

    const sites = await queryBuilder.getMany();

    const allSites: Promise<Site>[] = sites.map(async site => {
      const subSites = await this.findSubSites(site, user);

      const subSitesTco2 = subSites.map(async subSite => {
        return {
          ...subSite,
        }
      });

      const subSitesWithTco2 = await Promise.all(subSitesTco2);

      return {
        ...site,
        subSites: subSitesWithTco2
      };
    });

    const sitesWithSubs = await Promise.all(allSites);

    return sitesWithSubs;
  }

  async findAllForUser(user: User): Promise<Site[]> {
    const queryBuilder = this.createQueryBuilder("s")
      .innerJoin("s.perimeter", "perimeter")
      .innerJoin(
        UserRoleWithinPerimeter,
        "urwp",
        "urwp.perimeter_id=perimeter.id"
      )
      .innerJoin(User, "u", "u.id = urwp.user_id AND u.id = :userId", {
        userId: user.id,
      });

    const sites = await queryBuilder.getMany();

    const allSites: Promise<SitesWithSubs>[] = sites.map(async site => {
      const subSites = await this.findSubSites(site, user);

      const subSitesTco2 = subSites.map(async subSite => {
        return {
          ...subSite,
        }
      });

      const subSitesWithTco2 = await Promise.all(subSitesTco2);

      return {
        ...site,
        subSites: subSitesWithTco2
      };
    });

    const sitesWithSubs = await Promise.all(allSites);

    return sitesWithSubs;
  }
}
