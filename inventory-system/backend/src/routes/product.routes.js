const router = require("express").Router();
const ctrl = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth);
router.get("/", ctrl.list);
router.get("/low-stock", ctrl.lowStock);
router.get("/:id", ctrl.getOne);
router.post("/", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.create);
router.post("/bulk-import", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.bulkImport);
router.post("/:id/duplicate", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.duplicate);
router.put("/:id", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.update);
router.delete("/:id", allowRoles("super_admin", "admin"), ctrl.remove);

module.exports = router;
