const router = require("express").Router();
const ctrl = require("../controllers/customer.controller");
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.use(auth);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", allowRoles("super_admin", "admin"), ctrl.remove);

module.exports = router;
