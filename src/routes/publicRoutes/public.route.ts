import {Router} from "express";
const router = Router();

import { checkRestaurantSlug,getMenuItemsPublic } from "../../controllers/menu.controller";

// menu routes
router.param("restaurantSlug",checkRestaurantSlug);
router.route("/:restaurantSlug/menu").get(getMenuItemsPublic)

export default router;
