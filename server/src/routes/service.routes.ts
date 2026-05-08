import {Router} from "express";
import { getServices, getService, createService, updateService, deleteService } from '../controllers/service.controller'
import {authenticate} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getServices);
router.get("/:id", getService);
router.post("/", createService);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;