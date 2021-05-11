//REQUIRES librerias requeridas
const express = require("express");
const morgan = require("morgan"); //Indica cuando alguien llama un ENDPOINT
const cors = require("cors"); //configura las politicas de acceso desde otra url
const mongoose = require("mongoose"); //para interactuar facilmente con la base mongo
const colors = require("colors"); // imprime consele.log condiferentes colores para develo

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
app.use("/api", require("./routes/devices.js"));//
app.use("/api", require("./routes/users.js"));//informacion de usuarios
app.use("/api", require("./routes/templates.js"));
app.use("/api", require("./routes/webhooks.js"));//se comunica con mi dashboard emqx
app.use("/api", require("./routes/emqxapi.js"));
// permite ordenar las rutas(anteriormente creadas) o endpoints en archivos separados.
module.exports = app;

//LISTENER pueto que escucha si alguien hace una peticion
//con express escuchamos en el puerto 3001
app.listen(3001, () => {
    console.log("API server listening on port 3001");
});

//Mongo Conection
const mongoUserName = "devuser"
const mongoPassword = "devpassword"
const mongoHost = "localhost"
const mongoPort = "27017"
const mongoDatabase = "iotgl"

var uri = "mongodb://" + mongoUserName + ":" + mongoPassword + "@" + mongoHost + ":" + mongoPort + "/" + mongoDatabase

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    authSource: "admin"
}

try {
    mongoose.connect(uri, options).then(
        () => {
          console.log("\n");
          console.log("*******************************".green);
          console.log("✔ Mongo Successfully Connected!".green);
          console.log("*******************************".green);
          console.log("\n");
        },
        (err) => {
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