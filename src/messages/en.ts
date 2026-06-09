import { homeTranslations } from "./(home)";
import { adminTranslations } from "./admin";
import { applicantsJobIdTranslations } from "./applicants/[jobId]";
import { applicationsTranslations } from "./applications";
import { authTranslations } from "./auth";
import { dashboardTranslations } from "./dashboard";
import { jobsTranslations } from "./jobs";
import { jobsJobIdTranslations } from "./jobs/[jobId]";
import { listingsTranslations } from "./listings";
import { postTranslations } from "./post";
import { pricingTranslations } from "./pricing";
import { profileTranslations } from "./profile";
import { settingsTranslations } from "./settings";

const messages = {
  home: homeTranslations.en,
  admin: adminTranslations.en,
  applicants: { jobId: applicantsJobIdTranslations.en },
  applications: applicationsTranslations.en,
  auth: authTranslations.en,
  dashboard: dashboardTranslations.en,
  jobs: { ...jobsTranslations.en, jobId: jobsJobIdTranslations.en },
  listings: listingsTranslations.en,
  post: postTranslations.en,
  pricing: pricingTranslations.en,
  profile: profileTranslations.en,
  settings: settingsTranslations.en,
};

export default messages;
