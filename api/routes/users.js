const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); //con esta libreria encriptamos las contrasenas
const bcrypt = require("bcrypt");

//models import
import User from "../models/user.js";

//AUTH
router.post("/register", (req, res) => {

});

router.post("/login", (req, res) => {

});


router.get("/new-user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Benjamin",
      email: "a@b.com",
      password: "121212"
    });
    res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.json({ status: "fail" });
  }
});

module.exports = router; //se exporta el ruteador para que lo tenga en cuenta el index
