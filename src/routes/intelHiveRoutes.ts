import { Router } from "express";
import intelHiveController from "../controllers/messageController.js";

const router = Router();

router.post("/", intelHiveController);

export default router;
