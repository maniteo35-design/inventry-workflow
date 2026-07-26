const router = require("express").Router();
const ctrl = require("../controllers/sale.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth);
router.get("/", ctrl.list);
router.get("/held", ctrl.heldSales);
router.get("/:id", ctrl.getOne);
router.post("/", allowRoles("super_admin", "admin", "manager", "salesperson"), ctrl.create);
router.post("/:id/refund", allowRoles("super_admin", "admin", "manager"), ctrl.refund);

module.exports = router;
