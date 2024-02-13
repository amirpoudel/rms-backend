import {Router} from "express";
const router = Router();
import * as feedbackController from "../../controllers/feedback.controller";

router.route("/").get(feedbackController.getFeedbacks);

export default router;