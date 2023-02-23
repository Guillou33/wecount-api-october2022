import request from "supertest";
import { app } from "@root/app";

import { getJwtUser } from "@root/test/utils/utils";
import {
  userFour,
  userCollaborator,
  userManager,
  theAdmin,
  weepulseAdmin,
  entryOwner,
  entryWriter,
} from "@root/test/mock/users";

import { Status } from "@entity/enum/Status";
import { ComputeMethodType } from "@entity/enum/ComputeMethodType";
import { getManager } from "typeorm";

export const activityEntryDefaults = {
  title: "activity-entry-1",
  siteId: undefined,
  productId: undefined,
  description: "activity-entry-1-description",
  isExcludedFromTrajectory: 0,
  manualTco2: null,
  manualUnitNumber: null,
  value: null,
  value2: null,
  uncertainty: 0,
  resultTco2: 0,
  status: Status.IN_PROGRESS,
  dataSource: "activity-entry-1-data-source",
  computeMethodType: ComputeMethodType.STANDARD,
  computeMethodId: 1,
  emissionFactorId: 1,
  instruction: null,
  ownerId: 9,
  writerId: 10,
  entryTagIds: [],
};

async function restoreActivityEntry() {
  const em = getManager();
  return em.query(`UPDATE activity_entry SET 
    title='${activityEntryDefaults.title}',
    site_id=${activityEntryDefaults.siteId ?? null},
    product_id=${activityEntryDefaults.productId ?? null},
    description='${activityEntryDefaults.description}',
    is_excluded_from_trajectory='${activityEntryDefaults.isExcludedFromTrajectory}',
    manual_tco2=${activityEntryDefaults.manualTco2},
    manual_unit_number=${activityEntryDefaults.manualUnitNumber},
    value=${activityEntryDefaults.value},
    value2=${activityEntryDefaults.value2},
    uncertainty=${activityEntryDefaults.uncertainty},
    result_tco2=${activityEntryDefaults.resultTco2},
    status='${activityEntryDefaults.status}',
    data_source='${activityEntryDefaults.dataSource}',
    compute_method_type='${activityEntryDefaults.computeMethodType}',
    compute_method_id=${activityEntryDefaults.computeMethodId},
    emission_factor_id=${activityEntryDefaults.emissionFactorId},
    owner_id=${activityEntryDefaults.ownerId},
    writer_id=${activityEntryDefaults.writerId}
    WHERE id = 1`);
}

async function restoreEntryTagMappings(){
  const em = getManager();
  return em.query("DELETE FROM entry_tag_mapping WHERE activity_entry_id = 1");
}

afterEach(async () => {
  await restoreActivityEntry();
  await restoreEntryTagMappings();
});

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])("Denies a %s to update an activity entry site", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, siteId: 1 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])("Allows a %s to update an activity entry site", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, siteId: 1 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])("Denies a %s to update an activity entry product", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, productId: 1 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])("Allows a %s to update an activity entry product", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, productId: 1 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])(
  "Denies a %s to update an activity entry emission factor",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, emissionFactorId: 2 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])(
  "Allows a %s to update an activity entry emission factor",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, emissionFactorId: 2 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  }
);

it.each([
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])(
  "Denies a %s to update an activity entry owner",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, ownerId: 1 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])(
  "Allows a %s to update an activity entry owner",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, ownerId: 1 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  }
);

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry writer", entryWriter],
])("Denies a %s to update an activity entry status", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, status: Status.TERMINATED })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
  ["entry owner", entryOwner],
])("Allows a %s to update an activity entry status", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, status: Status.TERMINATED })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry writer", entryWriter],
])("Denies a %s to update an activity entry instruction", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, instruction: "new-instruction" })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
  ["entry owner", entryOwner],
])("Allows a %s to update an activity entry instruction", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, instruction: "new-instruction" })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry writer", entryWriter],
])("Denies a %s to update an activity entry writer", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, writerId: 3 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(403);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
  ["entry owner", entryOwner],
])("Allows a %s to update an activity entry writer", async (_, user) => {
  await request(app)
    .put("/campaigns/2/activity-entries/1")
    .send({ ...activityEntryDefaults, writerId: 3 })
    .set("Authorization", `Bearer ${getJwtUser(user)}`)
    .expect(200);
});

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])(
  "Denies a %s to update an activity entry compute method id",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, computeMethodId: 3 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])(
  "Allows a %s to update an activity entry compute method id",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({ ...activityEntryDefaults, computeMethodId: 3 })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  }
);

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])(
  "Denies a %s to update an activity entry compute method type",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({
        ...activityEntryDefaults,
        computeMethodType: ComputeMethodType.RAW_DATA,
      })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
])(
  "Allows a %s to update an activity entry compute method type",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({
        ...activityEntryDefaults,
        computeMethodType: ComputeMethodType.RAW_DATA,
      })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  }
);

it.each([
  ["perimeter collaborator", userCollaborator],
  ["perimeter contributor", userFour],
  ["user out of company", weepulseAdmin],
  ["entry writer", entryWriter],
])(
  "Denies a %s to update an activity entry tag mappings",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({
        ...activityEntryDefaults,
        entryTagIds: [1, 2],
      })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(403);
  }
);

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
  ["entry owner", entryOwner],
])(
  "Allows a %s to update an activity entry tag mappings",
  async (_, user) => {
    await request(app)
      .put("/campaigns/2/activity-entries/1")
      .send({
        ...activityEntryDefaults,
        entryTagIds: [1, 3],
      })
      .set("Authorization", `Bearer ${getJwtUser(user)}`)
      .expect(200);
  }
);

const updates = {
  description: "updated-description",
  manualTco2: 42,
  manualUnitNumber: 42,
  value: 42,
  value2: 42,
  uncertainty: 42,
  dataSource: "updated-data-source",
};

it.each([
  ["user out of company", weepulseAdmin],
  ["perimeter contributor", userFour],
  ["perimeter collaborator", userCollaborator],
])("Denies a %s to update an activity entry other fields", async (_, user) => {
  const requests = Object.entries(updates).map(
    ([property, value]: [string, string | number]) =>
      request(app)
        .put("/campaigns/2/activity-entries/1")
        .send({ ...activityEntryDefaults, [property]: value })
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
  );

  const responses = await Promise.all(requests);
  expect(responses.every(res => res.status === 403)).toBe(true);
});

it.each([
  ["perimeter manager", userManager],
  ["perimeter admin", theAdmin],
  ["entry owner", entryOwner],
  ["entry writer", entryWriter],
])("Allows a %s to update an activity entry other fields", async (_, user) => {
  const requests = Object.entries(updates).map(
    ([property, value]: [string, string | number]) =>
      request(app)
        .put("/campaigns/2/activity-entries/1")
        .send({ ...activityEntryDefaults, [property]: value })
        .set("Authorization", `Bearer ${getJwtUser(user)}`)
  );

  const responses = await Promise.all(requests);
  expect(responses.every(res => res.status === 200)).toBe(true);
});
