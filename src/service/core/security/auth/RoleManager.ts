import {
  ROLES,
  PERIMETER_ROLES,
  AllRoles,
  RoleHierarchy,
  ROLES_HERARCHY,
  PERIMETER_ROLES_HIERARCHY,
} from "@service/core/security/auth/config";

class RoleManager<RoleType extends AllRoles> {
  roleHierarchyConfig: RoleHierarchy<RoleType>;

  constructor(hierarchyConfig: RoleHierarchy<RoleType>) {
    this.roleHierarchyConfig = hierarchyConfig;
  }

  /**
   * Get all roles granted by role
   */
  private fillRolesGranted(
    role: RoleType,
    rolesGranted: RoleType[] = []
  ): RoleType[] {
    if (!(role in this.roleHierarchyConfig)) {
      return rolesGranted;
    }

    const newRoles = this.roleHierarchyConfig[role] ?? [];
    rolesGranted.push(...newRoles);

    newRoles.forEach(newRole => {
      rolesGranted = this.fillRolesGranted(newRole, rolesGranted);
    });

    return rolesGranted;
  }

  roleGrants(role1: RoleType, role2: RoleType) {
    if (role1 === role2) {
      return true;
    }

    const rolesGranted = this.fillRolesGranted(role1);

    return rolesGranted.indexOf(role2) !== -1;
  }

  isGranted(
    havingRoles: { roles: RoleType[] },
    roleToCheck: RoleType
  ): boolean {
    if (
      roleToCheck === ROLES.ROLE_ANONYMOUS ||
      roleToCheck === PERIMETER_ROLES.PERIMETER_ANONYMOUS
    ) {
      return true;
    }

    let roleIsGranted = false;
    havingRoles.roles.forEach(role => {
      if (roleIsGranted) {
        return;
      }
      if (this.roleGrants(role, roleToCheck)) {
        roleIsGranted = true;
      }
    });

    return roleIsGranted;
  }
}

export const roleManager = new RoleManager(ROLES_HERARCHY);
export const perimeterRoleManager = new RoleManager(PERIMETER_ROLES_HIERARCHY);
