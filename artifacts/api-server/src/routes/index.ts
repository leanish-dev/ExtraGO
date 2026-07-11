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
import feedRouter from "./feed";
import profileSectionsRouter from "./profile-sections";
import chatRouter from "./chat";
import setupRouter from "./setup";
import seedRouter from "./seed";
import governanceRouter from "./governance";
import categoriesRouter from "./categories";
import verificationRouter from "./verification";
import kycAdminRouter from "./kyc-admin";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "extraGO API" });
});

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
router.use(feedRouter);
router.use(profileSectionsRouter);
router.use(chatRouter);
router.use(setupRouter);
router.use(seedRouter);
router.use(governanceRouter);
router.use(categoriesRouter);
router.use(verificationRouter);
router.use(kycAdminRouter);

export default router;
