const jwt = require('jsonwebtoken');

let checkAuth = (req, res, next) => {
    //en token guardamos el token que nos enviaron en el get de devices
    let token = req.get('token');
    //se verifica el token enviado, quetenga la firma que incorporamos, da error o se decoded
    jwt.verify(token, "securePasswordHere", (err, decoded) => {

        if (err){
            return res.status(401).json({
              status: "error",
              error: err  
            });
        }
        //si es correcto, en el userData que enviaron ponemos el userData decodificado
        req.userData = decoded.userData;
        // y con next continuamos donde se llamo la autenticacion
        next();

    });

}

module.exports = {checkAuth}  