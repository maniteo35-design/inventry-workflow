const router = require("express").Router();
const ctrl = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth.middleware");

router.use(auth);
router.get("/summary", ctrl.summary);
router.get("/sales-chart", ctrl.salesChart);

module.exports = router;
