const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); //con esta damos un toke al usuario= dar uncodigo(sus datos) 
//encriptado para validarse
// por un timpo si que tenga que escribir la contraseña cada vez durante ese tiemp
const bcrypt = require("bcrypt");//con esta libreria encriptamos las contrasenas
  
//models import
import User from "../models/user.js";

//POST -> req.body
//GET -> req.query

//LOGIN
router.post("/register", async (req, res) => {
  try {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const encryptedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      name: name,
      email: email,
      password: encryptedPassword
    };

    var user = await User.create(newUser);

    console.log(user);

    const toSend = {
      status: "success"
    };

    res.status(200).json(toSend);

  } catch (error) {
      
      console.log("ERROR - REGISTER ENDPOINT")
      console.log(error);

      const toSend = {
        status: "error",
        error: error
      };

      res.status(500).json(toSend);

  }
});

//REGISTER
router.post("/login", async (req, res) => {
  // en un login resibimos el email y password
  const email = req.body.email;
  const password = req.body.password;
  //Primero buscamos en la base el email para saber si esta registrado 
  // entonces a user lo cargamos con la busqueda en la base findOne de solo un email que coniside
  // con el campo email del email recibido en req.body.email. con await espera hata  tener respuesta
  // de la base.
  var user = await User.findOne({email: email});
 
  //if no email
  if(!user){ 
      const toSend = {
          status: "error",
          error: "Invalid Credentials"
      }
      //si no existe el usuario sale y no continua verificando el proceso
      //el codigo 401 se usa para indicar credenciales erroneas
      return res.status(401).json(toSend);
  }

  //if email and password ok
  if (bcrypt.compareSync(password, user.password)){
      //con la siguiente instruccion eliminamos el password de la variable user
      // para no entregarla en el token siguiente.
      user.set('password', undefined, {strict: false});
      //userData resibe a user(sin password) y se encripta con jwt, "securePasswordHere" es la firma de 
      // encriptado para que nuestro sistema determine que ese token fue generado por nosotros y la 
      // expiracion esta dada en segundos asi = 60sg * 60min * 24h * 30dias
      const token = jwt.sign({userData: user}, 'securePasswordHere', {expiresIn: 60 * 60 * 24 * 30});

      const toSend = {
          status: "success",
          token: token,
          userData: user
      }

      return res.json(toSend);

  }else{
      const toSend = {
          status: "error",
          error: "Invalid Credentials"
      }
      return res.status(401).json(toSend);
  }



});

//EJEMPLO DE REGISTRARSE CON EL METODO GET--
// router.get("/new-user", async (req, res) => {
//   try {
//     const user = await User.create({
//       name: "Benjamin",
//       email: "a@b.com",
//       password: "121212"
//     });
//     res.json({ status: "success" });
//   } catch (error) {
//     console.log(error);
//     res.json({ status: "fail" });
//   }
// });

module.exports = router; //se exporta el ruteador para que lo tenga en cuenta el index
