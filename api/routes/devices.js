const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/authentication.js");
const axios = require("axios");

/*
 ___  ______________ _____ _      _____ 
|  \/  |  _  |  _  \  ___| |    /  ___|
| .  . | | | | | | | |__ | |    \ `--. 
| |\/| | | | | | | |  __|| |     `--. \
| |  | \ \_/ / |/ /| |___| |____/\__/ /
\_|  |_/\___/|___/ \____/\_____/\____/  
*/
import Device from "../models/device.js";
import SaverRule from "../models/emqx_saver_rule.js";
import Template from "../models/template.js";
import AlarmRule from "../models/emqx_alarm_rule.js";

/* 
  ___  ______ _____ 
 / _ \ | ___ \_   _|
/ /_\ \| |_/ / | |   
|  _  ||  __/  | |  
| | | || |    _| |_ 
\_| |_/\_|    \___/ 
*/

const auth = {
  auth: {
    username: "admin",
    password: "emqxsecret"
  }
};

//GET DEVICES con get traemos informacion del dispositivo
/*en req tenemos el contenido de userData luego de desencriptarlo en 
    checkAuth en authentication.js*/
router.get("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    //get devices
    /**Expicacion de las dos lineas siguientes clase 157
     * si find() se usa con solo estos parentesis trae todos los dispositivos, con los
     * otros se hace un filtro
     * Para modificar devices debe ser un objeto de JavaScrit, el que obtenemos es un
     * arreglo de mongoose(tipo de dato especial) y no se puede modificar, y para evitar
     * la reactividad no deseada y para poderlo  modificar debemos ejecutar la linea que lo pasa
     * a string y lo retorna como javascript, otraforma es:
     * var newObj = Object.assign({}, oldObj)
     * donde pasamos el objeto original(oldObj) y nos retorna el nuevo desacoplado(newObj)
     */
    var devices = await Device.find({ userId: userId });
    devices = JSON.parse(JSON.stringify(devices));

    //get saver rules
    /**clase 157  en la siguiente parte de codigo recorremos dispositivo por dispositivo y
     * saverRule por saverRule y cuando coincida regla con dispositivo le pasamos
     * al dispositivo su respectiva regla
     */
    const saverRules = await getSaverRules(userId);

    //get templates
    const templates = await getTemplates(userId);

    //get alarm rules
    const alarmRules = await getAlarmRules(userId);

    //console.log(templates);

    //saver rules to -> devices
    devices.forEach((device, index) => {
      devices[index].saverRule = saverRules.filter(
        saverRule => saverRule.dId == device.dId
      )[0];
      devices[index].template = templates.filter(
        template => template._id == device.templateId
      )[0];
      devices[index].alarmRules = alarmRules.filter(
        alarmRule => alarmRule.dId == device.dId
      );
    });

    const toSend = {
      status: "success",
      data: devices
    };

    res.json(toSend);
  } catch (error) {
    console.log("ERROR GETTING DEVICES");
    console.log(error);

    const toSend = {
      status: "error",
      error: error
    };

    return res.status(500).json(toSend);
  }
});

/**Formato del nuevo dispositivo
 * {
 *    "newDevice":{
 *     "dId":"121212",
 *     "name":"HOME",
 *     "templateName":"esp32 template",
 *     "templateId":"ababab"
 *  }
 * }
 */

//NEW DEVICE con post creamos un dispositivo
router.post("/device", checkAuth, async (req, res) => {
  try {
    /*el id del usuari lo rescatamos siempre de userData nunca del newDevice
     el userData se rescata de la desencriptacion en authentication.js, llamado en la 
    linea anterior con checkAuth*/
    const userId = req.userData._id;
    var newDevice = req.body.newDevice; //newDevice entra por el body del metodo post
    /*adicionamos el userId al nuevo dispositivo por que viene sin el y es requerido,
    creando el nuevo campo, igual hacemos conla fecha de creacion(createdTime) en 
    formato unix que es un numero que es la cantidad de segundos que han pasado desde
    enero de 1970*/
    newDevice.userId = userId;
    newDevice.createdTime = Date.now();

    //Con el siguiente await garatizo que todo espera hasta que tengamos una respuesta de si se creo
    //o no la regla de salvado, explicado clase 156
    await createSaverRule(userId, newDevice.dId, true); //el true es para activar la saver rule

    /* voy a operar en la base mongo atraves de mongoos, le pido que espere(await) el resultado
    no la promesa del resultado, usando el modelo Device.create para crear usuarios, luego
    paso el nuevo dispositivo que tengo en newDevice.
   */
    const device = await Device.create(newDevice);

    //Llamamos la funcion que pone en true el dispositivo seleccionado
    await selectDevice(userId, newDevice.dId);

    //Preparamos la repuesta para el cliente, que se creo bien.
    const toSend = {
      status: "success"
    };
    //enviamos la respuesta
    return res.json(toSend);
  } catch (error) {
    console.log("ERROR CREATING NEW DEVICE");
    console.log(error);

    const toSend = {
      status: "error",
      error: error
    };
    return res.status(500).json(toSend);
  }
});

// DELETE DEVICE con delete borramos un dispositivo
router.delete("/device", checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;
    const dId = req.query.dId;

    await deleteSaverRule(dId);
    const result = await Device.deleteOne({ userId: userId, dId: dId });

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

//UPDATE DEVICE (SELECTOR)
//con put actualizamos un dispositivo
router.put("/device", checkAuth, async (req, res) => {
  const dId = req.body.dId;
  const userId = req.userData._id;

  if (await selectDevice(userId, dId)) {
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
});

//SAVER-RULE STATUS UPDATER
router.put("/saver-rule", checkAuth, async (req, res) => {
  const rule = req.body.rule;

  console.log(rule);

  await updateSaverRuleStatus(rule.emqxRuleId, rule.status);

  const toSend = {
    status: "success"
  };

  res.json(toSend);
});

/* 
______ _   _ _   _ _____ _____ _____ _____ _   _  _____ 
|  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |/  ___|
| |_  | | | |  \| | /  \/ | |   | | | | | |  \| |\ `--. 
|  _| | | | | . ` | |     | |   | | | | | | . ` | `--. \
| |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |/\__/ /
\_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/\____/  
*/

async function getAlarmRules(userId) {

  try {
      const rules = await AlarmRule.find({ userId: userId });
      return rules;
  } catch (error) {
      return "error";
  }

}


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

/*
 SAVER RULES FUNCTIONS
*/

//get templates
async function getTemplates(userId) {
  try {
    const templates = await Template.find({ userId: userId });
    return templates;
  } catch (error) {
    return false;
  }
}

//get saver rules
async function getSaverRules(userId) {
  try {
    const rules = await SaverRule.find({ userId: userId });
    return rules;
  } catch (error) {
    return false;
  }
}

//create saver rule
async function createSaverRule(userId, dId, status) {
  console.log(userId);
  console.log(dId);
  console.log(status);

  try {
    const url = "http://localhost:8085/api/v4/rules";

    const topic = userId + "/" + dId + "/+/sdata";
    //rawsql es la  consulta de la regla
    const rawsql =
      'SELECT topic, payload FROM "' + topic + '" WHERE payload.save = 1';
    //"SELECT topic, payload FROM \"" + topic + "\" WHERE payload.save = 1";
    var newRule = {
      rawsql: rawsql,
      actions: [
        //estas son las acciones que aparecen en emqx/rule
        {
          name: "data_to_webserver",
          params: {
            $resource: global.saverResource.id,
            payload_tmpl:
              '{"userId":"' +
              userId +
              '","payload":${payload},"topic":"${topic}"}'
          }
        }
      ],
      description: "SAVER-RULE",
      enabled: status
    };

    //save rule in emqx - grabamos la regla en emqx
    const res = await axios.post(url, newRule, auth);
    console.log(res.data.data);

    if (res.status === 200 && res.data.data) {
      await SaverRule.create({
        userId: userId,
        dId: dId,
        emqxRuleId: res.data.data.id,
        status: status
      });

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Error creating saver rule");
    console.log(error);
    return false;
  }
}

//update saver rule
async function updateSaverRuleStatus(emqxRuleId, status) {
  try {
    const url = "http://localhost:8085/api/v4/rules/" + emqxRuleId;

    const newRule = {
      enabled: status
    };
    const res = await axios.put(url, newRule, auth);
    if (res.status === 200 && res.data.data) {
      await SaverRule.updateOne({ emqxRuleId: emqxRuleId }, { status: status });
      console.log("Saver Rule Status Updated...".green);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
//delete saver rule
async function deleteSaverRule(dId) {
  try {
    const mongoRule = await SaverRule.findOne({ dId: dId });
    const url = "http://localhost:8085/api/v4/rules/" + mongoRule.emqxRuleId;
    const emqxRule = await axios.delete(url, auth);

    const deleted = await SaverRule.deleteOne({ dId: dId });
    return true;
  } catch (error) {
    console.log("Error deleting saver rule");
    console.log(error);
    return false;
  }
}

module.exports = router; //se exporta el ruteador para que lo tenga en cuenta el index

/*
userId/dId/temperature -> 
{
  value: 21,
  save: 1
}
*/
