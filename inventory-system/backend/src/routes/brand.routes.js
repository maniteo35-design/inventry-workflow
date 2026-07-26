const router = require("express").Router();
const ctrl = require("../controllers/brand.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth);
router.get("/", ctrl.list);
router.post("/", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.create);
router.put("/:id", allowRoles("super_admin", "admin", "inventory_officer"), ctrl.update);
router.delete("/:id", allowRoles("super_admin", "admin"), ctrl.remove);

module.exports = router;
