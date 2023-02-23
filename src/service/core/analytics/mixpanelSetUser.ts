import { User } from "@root/entity";
import mixpanel from "./mixpanel";

export const mixpanelSetUser = (user: User | undefined) => {
  try {
    if (user?.email) {
      mixpanel.setPeople(user?.email, {
        $email: user?.email,
        company: user?.company.name,
        $created: user.createdAt.toISOString(),
      });
    }
  } catch (error) {}
}
