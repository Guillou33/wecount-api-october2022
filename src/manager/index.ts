import refreshTokenManager from "@manager/auth/refreshTokenManager";
import userManager from "@manager/auth/userManager";
import profileManager from "@manager/core/profileManager";
import companyManager from "@manager/core/companyManager";
import campaignManager from "@manager/core/campaignManager";
import siteManager from "@manager/core/siteManager";
import productManager from "@manager/core/productManager";
import activityCategoryManager from "@manager/activity/activityCategoryManager";
import activityModelManager from "@manager/activity/activityModelManager";
import activityManager from "@manager/activity/activityManager";
import activityEntryManager from "@manager/activity/activityEntryManager";
import activityEntryReferenceManager from "@manager/activity/activityEntryReferenceManager";
import emissionFactorMappingManager from "@manager/activity/emissionFactorMappingManager";
import emissionFactorManager from "@manager/activity/emissionFactorManager";
import computeMethodManager from "@manager/activity/computeMethodManager";
import trajectoryManager from "@manager/trajectory/trajectoryManager";
import actionPlanManager from "@manager/trajectory/actionPlanManager";
import indicatorManager from "@manager/indicator/indicatorManager";
import perimeterManager from "@manager/core/perimeterManager";
import trajectorySettingsManager from "./trajectory/trajectorySettingsManager";
import reglementationTableManager from "@manager/reglementationTable/reglementationTableManager";
import computeMethodRepartitionManager from "@manager/reglementationTable/computeMethodRepartitionManager";
import activityModelRepartitionManager from "@manager/reglementationTable/activityModelRepartitionManager";
import entryTagManager from "@manager/core/entryTagManager";
import contentManager from "@manager/translation/contentManager";
import computeMethodRepartitionExceptionManager from "@root/manager/reglementationTable/computeMethodRepartitionExceptionManager";
import activityEntryResultBEGESManager from "@root/manager/reglementationTable/activityEntryResultBEGESManager";
import activityEntryResultISOManager from "@root/manager/reglementationTable/activityEntryResultISOManager";
import activityEntryResultGHGManager from "@root/manager/reglementationTable/activityEntryResultGHGManager";

export {
  refreshTokenManager,
  userManager,
  profileManager,
  companyManager,
  campaignManager,
  siteManager,
  productManager,
  activityCategoryManager,
  activityModelManager,
  activityManager,
  activityEntryManager,
  activityEntryReferenceManager,
  emissionFactorMappingManager,
  emissionFactorManager,
  computeMethodManager,
  trajectoryManager,
  actionPlanManager,
  indicatorManager,
  perimeterManager,
  trajectorySettingsManager,
  reglementationTableManager,
  computeMethodRepartitionManager,
  activityModelRepartitionManager,
  entryTagManager,
  contentManager,
  computeMethodRepartitionExceptionManager,
  activityEntryResultBEGESManager,
  activityEntryResultGHGManager,
  activityEntryResultISOManager,
};
