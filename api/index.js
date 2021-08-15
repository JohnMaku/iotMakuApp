//REQUIRES librerias requeridas
const express = require("express");
const morgan = require("morgan"); //Indica cuando alguien llama un ENDPOINT
const cors = require("cors"); //configura las politicas de acceso desde otra url
const mongoose = require("mongoose"); //para interactuar facilmente con la base mongo
const colors = require("colors"); // imprime consele.log condiferentes colores para develo
//la libreria dotenv se encarga de buscar las variables de entorno en el archivo .env
require('dotenv').config();
//INSTANCES con las siguientes variables llamo las librerias
const app = express();

//EXPRESS CONFIG
app.use(morgan("tiny")); //morgan reporta en formato tiny
app.use(express.json()); //permite trabajar con json en express
app.use(
  express.urlencoded({
    extended: true //Habilita pasar parametros porel buscador www....
  })
);
app.use(cors()); //Lepasamos las politicas de acceso a express

//express routes, todos los endpoint llevaran el prefijo api.
app.use("/api", require("./routes/devices.js")); //
app.use("/api", require("./routes/users.js")); //informacion de usuarios
app.use("/api", require("./routes/templates.js"));
app.use("/api", require("./routes/webhooks.js")); //se comunica con mi dashboard emqx
app.use("/api", require("./routes/emqxapi.js"));
app.use("/api", require("./routes/alarms.js"));
app.use("/api", require("./routes/dataprovider.js"));
// permite ordenar las rutas(anteriormente creadas) o endpoints en archivos separados.
module.exports = app;

//LISTENER pueto que escucha si alguien hace una peticion
//con express escuchamos en el puerto 3001
app.listen(process.env.API_PORT, () => {
  console.log("API server listening on port " + process.env.API_PORT);
});

//Mongo Conection
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort =process.env.MONGO_PORT;
const mongoDatabase =process.env.MONGO__DATABASE;

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase;

  console.log(uri)

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true, // adicionado clase 184
  authSource: "admin"
};

try {
  mongoose.connect(uri, options).then(
    () => {
      console.log("\n");
      console.log("*******************************".green);
      console.log("✔ Mongo Successfully Connected!".green);
      console.log("*******************************".green);
      console.log("\n");
      global.check_mqtt_superuser();
    },
    err => {
      console.log("\n");
      console.log("*******************************".red);
      console.log("    Mongo Connection Failed    ".red);
      console.log("*******************************".red);
      console.log("\n");
      console.log(err);
    }
  );
} catch (error) {
  console.log("ERROR CONNECTING MONGO ");
  console.log(error);
}
