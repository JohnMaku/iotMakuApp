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
//con get traemos informacion del dispositivo
    /*en req tenemos el contenido de userData luego de desencriptarlo en 
    checkAuth en authentication.js*/
router.get("/device", checkAuth ,(req, res) => {
    
    
})

/* 
{
   "newDevice":{     
      "dId":"121212",
      "name":"HOME",
      "templateName":"esp32 template",
      "templateId":"ababab"
   }
}
*/

//con post creamos un dispositivo 
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


//con borramos un dispositivo
router.delete("/device", (req, res) => {
    
})

//con put actualizamos un dispositivo
router.put("/device", (req, res) => {
    
})
/* 
______ _   _ _   _ _____ _____ _____ _____ _   _  _____ 
|  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |/  ___|
| |_  | | | |  \| | /  \/ | |   | | | | | |  \| |\ `--. 
|  _| | | | | . ` | |     | |   | | | | | | . ` | `--. \
| |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |/\__/ /
\_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/\____/  
*/




module.exports = router;//se exporta el ruteador para que lo tenga en cuenta el index