import {createRestaurant, updateRestaurantImage} from "../../controllers/restaurant.controller"

import {Router} from "express"

const router = Router();

import {upload} from "../../middlewares/multer.middleware";

router.route("/image").patch(upload.single("restaurantProfileImage"),updateRestaurantImage);



export default router;