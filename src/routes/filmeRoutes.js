const express = require("express");
const router = express.Router();
const filmeController = require("../controllers/filmeController");

router.get("/filme", filmeController.listar);
router.get("/filme/:id", filmeController.buscarPorId);
router.get("/filtro/filme", filmeController.filtrar);

module.exports = router;
