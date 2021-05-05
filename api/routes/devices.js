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
// prueba con post en postman  se usa body la opcion  raw formato json y se escribio esto en body
// {
//     "dId": "qwerty",
//     "userId": "HELLO FRON postman"
// }


 router.get("/test", (req, res) => {
     console.log(req.query)
     var toReturn = {
         status: "success",
         data: "HELLO FRON GET"
     }
    res.json(toReturn );
});

router.post("/test", (req, res) => {
    console.log(req.body)
    var toReturn = {
        status: "success",
        data: "HELLO FRON POST"
    }
   res.json(toReturn );
});


module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index