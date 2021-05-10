export const state = () => ({
  auth: null,
  devices: []
});
//como los valores de los estados no se pueden cambiar llamandolos directamente,
//se debe hacer atravez de una mutacion como se indica abajo, el nombre del metodo (setAuth)
//lo definimos nosotros, a este le pasamos el state que vamos a modificar(va completo) y
//tambien le pasamos los nuevos datos(auth), posteriormente cargo los nuevos datos, especificando
//la ruta de la variable a actualizar. la mutacion se llama con commit

export const mutations = {
  setAuth(state, auth) {
    state.auth = auth;
  },

  setDevices(state, devices) {
    state.devices = devices;
  }
};

//las acciones hacen mas que modificaciones como las mutaciones, pueden opera ...
//las acciones se llaman con dispatch
export const actions = {
  //lee el token almacenado en el dd
  readToken() {
    let auth = null;
    //hacemos un try-catch porque cuando hacemos operaciones de convertir un JSON
    // en un objeto de JavaScript puede bloquear todo y no sabriamos donde fue el error
    //esto lo evitamos con el try-catch
    try {
      //traemos el token y userdata del disco duro, le damos el nombre de la
      //etiqueta donde lo almcenamos en el dd y hacemos la operacion inversa
      //para que no sea JSON sino un objeto de javascipt, como nos obligaron a convertirlol
      auth = JSON.parse(localStorage.getItem("auth"));
    } catch (error) {
      console.log(err);
    }

    //saving auth in state. le paso el nombre de la mutacion(setAuth) que usaremos y el valor
    // para actualizar
    this.commit("setAuth", auth);
  },

  //getDevices es un metodo que hace un request atraves de axios
  getDevices() {
    //se crea un objeto con el token que se envia en este request en el encabezado
    const axiosHeader = {
      headers: {
        //traemos el token que se almacena en el dd luego de hacer un login
        token: this.state.auth.token
      }
    };
    //hacemos el request de axios, llamamos el metodo get le paso la url("/device")(que esta en api/
    //routes/devices.js) y le pasamos el token(axiosHeader), en otras palabras le pedimos los dispositivos
    // y le pasamos el token, luego usamos un callback(.then) que es la funcion con la respuesta
    this.$axios.get("/device", axiosHeader).then(res => {
      console.log(res.data.data);
      this.commit("setDevices", res.data.data) //llamo a la mutacion setDevices y le paso la lista de 
      //dispositivos que acaba de llegarme
    });
  },
};
