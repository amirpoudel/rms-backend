import {Router} from "express";
const router = Router();

import { checkRestaurantSlug,getMenuItemsPublic } from "../../controllers/menu.controller";
import { createFeedback } from "../../controllers/feedback.controller";

// menu routes
router.param("restaurantSlug",checkRestaurantSlug);
router.route("/:restaurantSlug/menu").get(getMenuItemsPublic)


router.route("/:restaurantSlug/feedback").post(createFeedback)

export default router;
