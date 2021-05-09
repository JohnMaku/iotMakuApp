 const express = require("express");
 const router = express.Router();

 const { checkAuth } = require('../middlewares/authentication.js')
/*
 ___  ______________ _____ _      _____ 
|  \/  |  _  |  _  \  ___| |    /  ___|
| .  . | | | | | | | |__ | |    \ `--. 
| |\/| | | | | | | |  __|| |     `--. \
| |  | \ \_/ / |/ /| |___| |____/\__/ /
\_|  |_/\___/|___/ \____/\_____/\____/  
*/
import Device from '../models/device.js';



/* 
  ___  ______ _____ 
 / _ \ | ___ \_   _|
/ /_\ \| |_/ / | |  
|  _  ||  __/  | |  
| | | || |    _| |_ 
\_| |_/\_|    \___/ 
*/
//GET DEVICES con get traemos informacion del dispositivo
    /*en req tenemos el contenido de userData luego de desencriptarlo en 
    checkAuth en authentication.js*/
router.get("/device", checkAuth ,async(req, res) => {
  try {
    const userId = req.userData._id;
    //si find() se usa con solo estos parentesis trae todos los dispositivos, con los
    //otros se hace un filtro
    const devices = await Device.find({ userId: userId });

    const toSend = {
      status: "success",
      data: devices
    };

    res.json(toSend);

  } catch (error) {

    console.log("ERROR GETTING DEVICES")

    const toSend = {
      status: "error",
      error: error
    };

    return res.status(500).json(toSend);
  }   
    
})

/* Formato del nuevo dispositivo
{
   "newDevice":{     
      "dId":"121212",
      "name":"HOME",
      "templateName":"esp32 template",
      "templateId":"ababab"
   }
}
*/

//NEW DEVICE con post creamos un dispositivo 
router.post("/device", checkAuth , async (req, res) => {

  try {
    /*el id del usuari lo rescatamos siempre de userData nunca del newDevice
     el userData se rescata de la desencriptacion en authentication.js, llamado en la 
    linea anterior con checkAuth*/
    const userId = req.userData._id;
    var newDevice = req.body.newDevice;//newDevice entra por el body del metodo post
  /*adicionamos el userId al nuevo dispositivo por que viene sin el y es requerido,
    creando el nuevo campo, igual hacemos conla fecha de creacion(createdTime) en 
    formato unix que es un numero que es la cantidad de segundos que han pasado desde
    enero de 1970*/
    newDevice.userId = userId;
    newDevice.createdTime = Date.now();
    
    /* voy a operar en la base mongo atraves de mongoos, le pido que espere(await) el resultado
    no la promesa del resultado, usando el modelo Device.create para crear usuarios, luego
    paso el nuevo dispositivo que tengo en newDevice.
   */
    const device = await Device.create(newDevice);

    //Llamamos la funcion que pone en true el dispositivo seleccionado
    selectDevice(userId, newDevice.dId);
  
    //Preparamos la repuesta para el cliente, que se creo bien. 
    const toSend = {
      status: "success"
    }
    //enviamos la respuesta
    return res.json(toSend);

  } catch (error) {
    console.log("ERROR CREATING NEW DEVICE");
    console.log(error);

    const toSend = {
      status: "error",
      error: error
    }  
    return res.status(500).json(toSend);
  }  
});


// DELETE DEVICE con delete borramos un dispositivo
router.delete("/device", checkAuth, async(req, res) => {

  try {
    const userId = req.userData._id;
    const dId = req.query.dId;


    const result = await Device.deleteOne({userId: userId, dId: dId});
  
    const toSend = {
      status: "success",
      data: result
    };
  
    return res.json(toSend);
    
  } catch (error) {

    console.log("ERROR DELETING DEVICE");
    console.log(error);

    const toSend = {
      status: "error",
      error: error
    };

    return res.status(500).json(toSend);
  }
});


//con put actualizamos un dispositivo
router.put("/device", checkAuth, (req, res) => {
  const dId = req.body.dId;
  const userId = req.userData._id;

  if (selectDevice(userId, dId)) {
    const toSend = {
      status: "success"
    };

    return res.json(toSend);
  } else {
    const toSend = {
      status: "error"
    };

    return res.json(toSend);
  }
    
})
/* 
______ _   _ _   _ _____ _____ _____ _____ _   _  _____ 
|  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |/  ___|
| |_  | | | |  \| | /  \/ | |   | | | | | |  \| |\ `--. 
|  _| | | | | . ` | |     | |   | | | | | | . ` | `--. \
| |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |/\__/ /
\_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/\____/  
*/

async function selectDevice(userId, dId) {
  try {
    //en esta parte actualizaremos con false los dispositivos del usuario que me llega como parametro
    //updateMany actualiza varios dispositivos
    const result = await Device.updateMany( 
      { userId: userId }, //FILTRO este es el campo de la base : y de estelado esta elvalor
      { selected: false } // LO QUE MODIFICAMOS 
    );

    const result2 = await Device.updateOne(
      { dId: dId, userId: userId },
      { selected: true }
    );

    return true;

  } catch (error) {
    console.log("ERROR IN 'selectDevice' FUNCTION ");
    console.log(error);
    return false;
  }
} 


module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index