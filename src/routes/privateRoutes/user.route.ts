import {loginUser, registerUserWithRestaurant} from "../../controllers/user.controller";
import {upload} from "../../middlewares/multer.middleware";

const restaurantImage = upload.single("restaurantProfileImage");

import {Router} from "express"
const router = Router();


router.route("/owner/register").post(restaurantImage,registerUserWithRestaurant)
router.route("/login").post(loginUser)


export default router;

