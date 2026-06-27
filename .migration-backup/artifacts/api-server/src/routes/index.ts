import { Router, type IRouter } from "express";
import healthRouter from "./health";
import personasRouter from "./personas";
import velasRouter from "./velas";
import recuerdosRouter from "./recuerdos";
import testimoniosRouter from "./testimonios";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(personasRouter);
router.use(velasRouter);
router.use(recuerdosRouter);
router.use(testimoniosRouter);
router.use(statsRouter);

export default router;
