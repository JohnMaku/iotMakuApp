 const express = require("express");
 const router = express.Router();

 router.get("/testing", (req, res) => { 
    res.send("Hello IoT Maku API from devices.js");
});

module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index