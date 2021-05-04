const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); //con esta libreria encriptamos las contrasenas
const bcrypt = require("bcrypt");

//models import
import User from "../models/user.js";

router.get("/new-user", async (req, res) => {
  const user = await User.create({
    name: "Benjamin",
    email: "a@a.com",
    password: "121212"
  });
});

module.exports = router; //se exporta el ruteador para que lo tenga en cuenta el index
