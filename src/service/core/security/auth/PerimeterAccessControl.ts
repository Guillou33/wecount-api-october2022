import { User, Perimeter } from "@root/entity";
import { userManager } from "@root/manager";
import { PERIMETER_ROLES } from "./config";
import { perimeterRoleManager } from "./RoleManager";
import { AccessDeniedError } from "../../error/response";

export default class PerimeterAccessControl {
  userRoleWithinPerimeter: Promise<PERIMETER_ROLES>;

  private constructor(user: User, perimeter: Perimeter) {
    this.userRoleWithinPerimeter = userManager.getRoleWithinPerimeter(
      user,
      perimeter
    );
  }

  static buildFor(user?: User, perimeter?: Perimeter): PerimeterAccessControl {
    if (user == null || perimeter == null) {
      throw new AccessDeniedError();
    }
    return new PerimeterAccessControl(user, perimeter);
  }

  async require(role: PERIMETER_ROLES) {
    const resolvedRole = await this.userRoleWithinPerimeter;
    if (!perimeterRoleManager.isGranted({ roles: [resolvedRole] }, role)) {
      throw new AccessDeniedError();
    }
  }

  async requireAdmin() {
    return this.require(PERIMETER_ROLES.PERIMETER_ADMIN);
  }

  async requireManager() {
    return this.require(PERIMETER_ROLES.PERIMETER_MANAGER);
  }

  async requireCollaborator() {
    return this.require(PERIMETER_ROLES.PERIMETER_COLLABORATOR);
  }

  async requireContributor() {
    return this.require(PERIMETER_ROLES.PERIMETER_CONTRIBUTOR);
  }
}
