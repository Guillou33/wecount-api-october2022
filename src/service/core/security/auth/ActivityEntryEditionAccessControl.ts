import { PERIMETER_ROLES } from "./config";
import { ComputeMethodType } from "@root/entity/enum/ComputeMethodType";
import { Status } from "@root/entity/enum/Status";
import { ActivityEntry, User, Perimeter, EntryTagMapping } from "@entity/index";
import { AccessDeniedError } from "../../error/response";
import { userManager } from "@root/manager";
import { perimeterRoleManager } from "./RoleManager";

export type ActivityEntryData = {
  computeMethodType: ComputeMethodType;
  computeMethodId: number | null;
  title: string | null;
  manualTco2: number | null | undefined;
  manualUnitNumber: number | null | undefined;
  uncertainty: number;
  value: number | null;
  value2: number | null;
  description: string | null;
  isExcludedFromTrajectory: boolean;
  dataSource: string | null;
  siteId: number | null | undefined;
  productId: number | null | undefined;
  customEmissionFactorId: number | null | undefined;
  emissionFactorId: number;
  status: Status;
  ownerId: number | null;
  writerId: number | null;
  instruction: string | null;
  entryTagIds: number[];
};

const activityEntryEditionAcl: {
  [key in keyof ActivityEntryData]?: PERIMETER_ROLES;
} = {
  siteId: PERIMETER_ROLES.PERIMETER_MANAGER,
  productId: PERIMETER_ROLES.PERIMETER_MANAGER,
  emissionFactorId: PERIMETER_ROLES.PERIMETER_MANAGER,
  computeMethodId: PERIMETER_ROLES.PERIMETER_MANAGER,
  computeMethodType: PERIMETER_ROLES.PERIMETER_MANAGER,
  ownerId: PERIMETER_ROLES.PERIMETER_MANAGER,
  status: PERIMETER_ROLES.ENTRY_OWNER,
  writerId: PERIMETER_ROLES.ENTRY_OWNER,
  instruction: PERIMETER_ROLES.ENTRY_OWNER,
  value: PERIMETER_ROLES.ENTRY_WRITER,
  value2: PERIMETER_ROLES.ENTRY_WRITER,
  manualTco2: PERIMETER_ROLES.ENTRY_WRITER,
  manualUnitNumber: PERIMETER_ROLES.ENTRY_WRITER,
  uncertainty: PERIMETER_ROLES.ENTRY_WRITER,
  description: PERIMETER_ROLES.ENTRY_WRITER,
  dataSource: PERIMETER_ROLES.ENTRY_WRITER,
  entryTagIds: PERIMETER_ROLES.ENTRY_OWNER,
};

function getRoleRequiredToEditProperty(
  propertyName: keyof ActivityEntryData
): PERIMETER_ROLES {
  return (
    activityEntryEditionAcl[propertyName] ??
    PERIMETER_ROLES.PERIMETER_CONTRIBUTOR
  );
}

function getRolesRequiredForEdition(
  activityEntry: ActivityEntry,
  activityEntryData: ActivityEntryData
): PERIMETER_ROLES[] {
  const roles: { [key in PERIMETER_ROLES]?: true } = {};

  for (const key in activityEntryData) {
    const property = key as keyof ActivityEntryData;

    const isPropertyChanging =
      property !== "entryTagIds"
        ? (activityEntry[property] ?? null) !== activityEntryData[property]
        : areEntryTagsChanging(
            activityEntryData.entryTagIds,
            activityEntry.entryTagMappings
          );

    if (isPropertyChanging) {
      roles[getRoleRequiredToEditProperty(property)] = true;
    }
  }
  return Object.keys(roles) as PERIMETER_ROLES[];
}

function areEntryTagsChanging(
  entryTagIds: number[],
  entryTagMappings: EntryTagMapping[]
): boolean {
  if (entryTagIds.length !== entryTagMappings.length) {
    return true;
  }
  return (
    entryTagIds.some(
      tagId =>
        entryTagMappings.find(tagMapping => tagMapping.entryTagId === tagId) ===
        undefined
    ) ||
    entryTagMappings.some(
      tagMapping =>
        entryTagIds.find(tagId => tagId === tagMapping.entryTagId) === undefined
    )
  );
}

function getUserRoleOnEntry(
  user: User,
  activityEntry: ActivityEntry
): PERIMETER_ROLES.ENTRY_OWNER | PERIMETER_ROLES.ENTRY_WRITER | null {
  if (activityEntry.ownerId === user.id) {
    return PERIMETER_ROLES.ENTRY_OWNER;
  }
  if (activityEntry.writerId === user.id) {
    return PERIMETER_ROLES.ENTRY_WRITER;
  }
  return null;
}

export default class ActivityEntryEditionAccessControl {
  userRoleOnActivityEntry: Promise<PERIMETER_ROLES>;
  activityEntry: ActivityEntry;

  private constructor(
    user: User,
    perimeter: Perimeter,
    activityEntry: ActivityEntry
  ) {
    this.userRoleOnActivityEntry = userManager
      .getRoleWithinPerimeter(user, perimeter)
      .then(perimeterRole => {
        const entryRole = getUserRoleOnEntry(user, activityEntry);

        if (
          (perimeterRole === PERIMETER_ROLES.PERIMETER_COLLABORATOR ||
            perimeterRole === PERIMETER_ROLES.PERIMETER_CONTRIBUTOR) &&
          entryRole !== null
        ) {
          return entryRole;
        }
        return perimeterRole;
      });
    this.activityEntry = activityEntry;
  }

  static buildFor(user: User | undefined, activityEntry: ActivityEntry) {
    const perimeter = activityEntry?.activity?.campaign?.perimeter;
    if (perimeter == null) {
      throw new Error(
        "The perimeter of the activity entry must be set on the activity entry"
      );
    }
    if (user == null) {
      throw new AccessDeniedError();
    }
    return new ActivityEntryEditionAccessControl(
      user,
      perimeter,
      activityEntry
    );
  }

  async validateEdition(activityEntryData: ActivityEntryData) {
    const resolvedRole = await this.userRoleOnActivityEntry;
    const isAuthorized = getRolesRequiredForEdition(
      this.activityEntry,
      activityEntryData
    ).every(role =>
      perimeterRoleManager.isGranted({ roles: [resolvedRole] }, role)
    );
    if (!isAuthorized) {
      throw new AccessDeniedError();
    }
  }
}
