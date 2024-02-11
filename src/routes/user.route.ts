import {loginUser, registerUserWithRestaurant} from "../controllers/user.controller";


import {Router} from "express"
const router = Router();


router.route("/owner/register").post(registerUserWithRestaurant)
router.route("/login").post(loginUser)


export default router;

