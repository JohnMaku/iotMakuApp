 const express = require("express");
 const router = express.Router();

 const { checkAuth } = require('../middlewares/authentication.js')

//con get traemos informacion del dispositivo
router.get("/device", checkAuth ,(req, res) => {
    //aqui vemos en consola el contenido de userData luego de desencriptarlo en 
    //checkAuth en authentication.js
    console.log(req.userData); 
  
    req.userData.userId
  
    const toSend = {
      status: "success",
      data: "[2 , 3 , 4 , 5 ]"
    };
  
    return res.status(200).json(toSend);
  
})

//con post creamos un dispositivo
router.post("/device", (req, res) => {
    
})

//con borramos un dispositivo
router.delete("/device", (req, res) => {
    
})

//con put actualizamos un dispositivo
router.put("/device", (req, res) => {
    
})




module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index