const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", ctrl.register); // In production, restrict this to super_admin after first setup
router.post("/login", ctrl.login);
router.get("/me", auth, ctrl.me);

module.exports = router;
