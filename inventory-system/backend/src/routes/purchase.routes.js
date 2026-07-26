const router = require("express").Router();
const ctrl = require("../controllers/purchase.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.create);
router.patch("/:id/deliver", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.markDelivered);

module.exports = router;
