import {Router } from "express";
const router = Router();
import * as menuController from "../controllers/menu.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import {upload} from "../middlewares/multer.middleware"

router.param("categoryId",menuController.checkMenuCategory);

router.route("/category").post(authenticateUser,menuController.createMenuCategory)
                         .get(authenticateUser,menuController.getMenuCategories);

router.route("/:categoryId/item").post(authenticateUser,upload.single('image'),menuController.createMenuItem)


export default router;