const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); //con esta damos un toke al usuario= dar uncodigo(sus datos)
//encriptado para validarse
// por un timpo si que tenga que escribir la contraseña cada vez durante ese tiemp
const bcrypt = require("bcrypt"); //con esta libreria encriptamos las contrasenas
const { checkAuth } = require("../middlewares/authentication.js");

//models import
import User from "../models/user.js";
import EmqxAuthRule from "../models/emqx_auth.js";

//POST -> req.body
//GET -> req.query
//******************
//**** A P I *******
//******************

//LOGIN
router.post("/login", async (req, res) => {
  try {
    // en un login resibimos el email y password
    const email = req.body.email;
    const password = req.body.password;
    //Primero buscamos en la base el email para saber si esta registrado
    // entonces a user lo cargamos con la busqueda en la base findOne de solo un email que coniside
    // con el campo email del email recibido en req.body.email. con await espera hata  tener respuesta
    // de la base.
    var user = await User.findOne({ email: email });

    //if no email
    if (!user) {
      const response = {
        status: "error",
        error: "Invalid Credentials"
      };
      //si no existe el usuario sale y no continua verificando el proceso
      //el codigo 401 se usa para indicar credenciales erroneas
      return res.status(401).json(response);
    }

    //if email and password ok
    if (bcrypt.compareSync(password, user.password)) {
      //con la siguiente instruccion eliminamos el password de la variable user
      // para no entregarla en el token siguiente.
      user.set("password", undefined, { strict: false });
      //userData resibe a user(sin password) y se encripta con jwt, "securePasswordHere" es la firma de
      // encriptado para que nuestro sistema determine que ese token fue generado por nosotros y la
      // expiracion esta dada en segundos asi = 60sg * 60min * 24h * 30dias
      const token = jwt.sign({ userData: user }, "securePasswordHere", {
        expiresIn: 60 * 60 * 24 * 30
      });

      const response = {
        status: "success",
        token: token,
        userData: user
      };

      return res.json(response);
    } else {
      const response = {
        status: "error",
        error: "Invalid Credentials"
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    console.log(error);
  }
});

//REGISTER
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

    const response = {
      status: "success"
    };

    res.status(200).json(response);
  } catch (error) {
    console.log("ERROR - REGISTER ENDPOINT");
    console.log(error);

    const response = {
      status: "error",
      error: error
    };

    console.log(response);

    return res.status(500).json(response);
  }
});

//GET MQTT WEB CREDENTIALS
router.post("/getmqttcredentials", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const credentials = await getWebUserMqttCredentials(userId);

    const response = {
      status: "success",
      username: credentials.username,
      password: credentials.password
    };

    res.json(response);

    setTimeout(() => {
      getWebUserMqttCredentials(userId);
    }, 5000);

    return;
  } catch (error) {
    console.log(error);

    const response = {
      status: "error"
    };

    return res.status(500).json(response);
  }
});

//GET MQTT CREDENTIALS FOR RECONNECTION
router.post(
  "/getmqttcredentialsforreconnection",
  checkAuth,
  async (req, res) => {
    try {
      const userId = req.userData._id;
      const credentials = await getWebUserMqttCredentialsForReconnection(
        userId
      );

      const response = {
        status: "success",
        username: credentials.username,
        password: credentials.password
      };

      console.log(response);
      res.json(response);

      setTimeout(() => {
        getWebUserMqttCredentials(userId);
      }, 15000);
    } catch (error) {
      console.log(error);
    }
  }
);

//**********************
//**** FUNCTIONS *******
//**********************

// mqtt credential types: "user", "device", "superuser"
async function getWebUserMqttCredentials(userId) {
  try {
    var rule = await EmqxAuthRule.find({ type: "user", userId: userId });

    if (rule.length == 0) {
      const newRule = {
        userId: userId,
        username: makeid(10), //con la funcion makeid genero un id aleatorio de 10 caracteres
        password: makeid(10),
        publish: [userId + "/#"], //Se le permite publicar solo en topicos de su usuario
        subscribe: [userId + "/#"], //no puede subscribirse a topicos de otro usuario
        type: "user",
        time: Date.now(),
        updatedTime: Date.now()
      };

      const result = await EmqxAuthRule.create(newRule);

      const toReturn = {
        username: result.username,
        password: result.password
      };

      return toReturn;
    }

    const newUserName = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne(
      { type: "user", userId: userId },
      {
        $set: {
          username: newUserName,
          password: newPassword,
          updatedTime: Date.now()
        }
      }
    );

    // update response example
    //{ n: 1, nModified: 1, ok: 1 }

    if (result.n == 1 && result.ok == 1) {
      return {
        username: newUsername,
        password: newPassword
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getWebUserMqttCredentialsForReconnection(userId) {
  try {
    const rule = await EmqxAuthRule.find({ type: "user", userId: userId });

    if (rule.length == 1) {
      const toReturn = {
        username: rule[0].username,
        password: rule[0].password
      };
      return toReturn;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
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
