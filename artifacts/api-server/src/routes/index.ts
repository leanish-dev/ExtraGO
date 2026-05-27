import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import walletRouter from "./wallet";
import referralsRouter from "./referrals";
import notificationsRouter from "./notifications";
import statsRouter from "./stats";
import adminRouter from "./admin";
import adminSettingsRouter from "./admin-settings";
import adminAuditRouter from "./admin-audit";
import adminFinancialRouter from "./admin-financial";
import feedRouter from "./feed";
import profileSectionsRouter from "./profile-sections";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(walletRouter);
router.use(referralsRouter);
router.use(notificationsRouter);
router.use(statsRouter);
router.use(adminRouter);
router.use(adminSettingsRouter);
router.use(adminAuditRouter);
router.use(adminFinancialRouter);
router.use(feedRouter);
router.use(profileSectionsRouter);
router.use(chatRouter);

export default router;
