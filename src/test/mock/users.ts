import { ROLES } from "@service/core/security/auth/config/index";

export const theAdmin = {
  id: 5,
  email: "user-admin@test.com",
  roles: [ROLES.ROLE_MANAGER],
};

export const weepulseAdmin = {
  id: 6,
  email: "stranger-admin@weepulse.fr",
  roles: [ROLES.ROLE_MANAGER],
};

export const userTwo = {
  id: 2,
  email: "user-two@test.com",
};

export const userCollaborator = {
  id: 7,
  email: "user-collaborator@wecount-testing.com",
};

export const userManager = {
  id: 8,
  email: "user-manager@wecount-testing.com",
};

export const userFour = {
  id: 4,
  email: "user-four@test.com",
};

export const entryOwner = {
  id: 9,
  email: "entry-owner@wecount-testing.com",
};

export const entryWriter = {
  id: 10,
  email: "entry-writer@wecount-testing.com",
};