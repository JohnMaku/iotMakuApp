 const express = require("express");
 const router = express.Router();

//  PRUEBA CON POSTMAN
//  Con el metodo GET y url "http://localhost:3001/api/test?dId=1234&userid=abcd"
// en postman debemos ver:
// {
//     "status": "success",
//     "data": {
//         "dId": "1234",
//         "userid": "abcd"
//     }
// }

 router.get("/test", (req, res) => {
     console.log(req.query.dId)
     var toReturn = {
         status: "success",
         data: req.query
     }
    res.json(toReturn );
});


module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index