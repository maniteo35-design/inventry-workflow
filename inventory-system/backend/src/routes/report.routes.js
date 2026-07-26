const router = require("express").Router();
const ctrl = require("../controllers/report.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth, allowRoles("super_admin", "admin", "manager"));
router.get("/sales", ctrl.salesReport);
router.get("/profit", ctrl.profitReport);
router.get("/stock", ctrl.stockReport);
router.get("/purchases", ctrl.purchaseReport);
router.get("/inventory-valuation", ctrl.inventoryValuation);

module.exports = router;
