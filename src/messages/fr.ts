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
  home: homeTranslations.fr,
  admin: adminTranslations.fr,
  applicants: { jobId: applicantsJobIdTranslations.fr },
  applications: applicationsTranslations.fr,
  auth: authTranslations.fr,
  dashboard: dashboardTranslations.fr,
  jobs: { ...jobsTranslations.fr, jobId: jobsJobIdTranslations.fr },
  listings: listingsTranslations.fr,
  post: postTranslations.fr,
  pricing: pricingTranslations.fr,
  profile: profileTranslations.fr,
  settings: settingsTranslations.fr,
};

export default messages;
