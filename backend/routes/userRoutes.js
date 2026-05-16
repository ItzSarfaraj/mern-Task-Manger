const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const {getUsers, getUserById} = require("../controllers/userController");

const router = express.Router();

//user managemnet routes
router.get("/",protect,adminOnly, getUsers); //get all users(Admin only)
router.get("/:id",protect,getUserById); // get a specific user 

module.exports = router;