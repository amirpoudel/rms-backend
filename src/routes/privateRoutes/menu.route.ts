import {Router } from "express";
const router = Router();
import * as menuController from "../../controllers/menu.controller";

import {upload} from "../../middlewares/multer.middleware"

router.param("categoryId",menuController.checkMenuCategory);
router.param("itemId",menuController.checkMenuItem)
router.param("restaurantSlug",menuController.checkRestaurantSlug);

router.route("/category").post(menuController.createMenuCategory)
                         .get(menuController.getMenuCategories);

router.route("/category/:categoryId").patch(menuController.updateMenuCategory)
                                    .delete(menuController.deleteMenuCategory)


router.route("/:categoryId/item").post(upload.single('image'),menuController.createMenuItem)
router.route("/item/:itemId").patch(menuController.updateMenuItem)
                             .delete(menuController.deleteMenuItem)
router.route("/item/:itemId/image").patch(upload.single('image'),menuController.updateMenuItemImage)

// public routes







export default router;