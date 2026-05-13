const express = require("express");
const ctrl = require("../controllers/productController");

const router = express.Router();

router.route("/").get(ctrl.list).post(ctrl.create);
router.route("/:id").put(ctrl.update).delete(ctrl.remove);

module.exports = router;