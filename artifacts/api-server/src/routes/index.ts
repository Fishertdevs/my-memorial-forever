import { Router } from "express";
import healthRouter from "./health.js";
import personasRouter from "./personas.js";
import velasRouter from "./velas.js";
import recuerdosRouter from "./recuerdos.js";
import testimoniosRouter from "./testimonios.js";
import statsRouter from "./stats.js";

const router = Router();

router.use(healthRouter);
router.use(personasRouter);
router.use(velasRouter);
router.use(recuerdosRouter);
router.use(testimoniosRouter);
router.use(statsRouter);

export default router;
