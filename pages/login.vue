<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">IoT GL</h1>
        </template>

        <div>
          <base-input
            name="email"
            v-model="user.email"
            placeholder="Email"
            addon-left-icon="tim-icons icon-email-85"
          >
          </base-input>

          <base-input
            name="password"
            v-model="user.password"
            type="password"
            placeholder="Password"
            addon-left-icon="tim-icons icon-lock-circle"
          >
          </base-input>
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            @click="login()"
            block
          >
            Login
          </base-button>
          <div class="pull-left">
            <h6>
              <nuxt-link class="link footer-link" to="/register">
                Create Account
              </nuxt-link>
            </h6>
          </div>

          <div class="pull-right">
            <h6><a href="#help!!!" class="link footer-link">Need Help?</a></h6>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
const Cookie = process.client ? require("js-cookie") : undefined;
export default {
  middleware: "notAuthenticated", //con este verificamos que si ya esta autenticado lo enviamos al dashboard
  name: "login-page",
  layout: "auth",
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
    };
  },
  mounted() {},
  methods: {
    login() {
      this.$axios
        .post("/login", this.user)
        .then((res) => {
          //success! - Usuario logeado .
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Welcome " + res.data.userData.name,
            });

            console.log(res.data);

            const auth = {
              token: res.data.token,
              userData: res.data.userData,
            };
            //Para tener token y los datos de usuario disponibles en cualquier lugar
            //los enviamos a un state(parecido a una variable global) en la carpeta
            //store y archivo index.
            //Para lograrlo, el metodo($store.commit) pide el nombre de la mutacion('setAuth')
            // y el nuevo valor(auth)
            this.$store.commit("setAuth", auth);

            //ahora grabamos los datos de autenticacion(auth) en el disco duro para que mientras
            // el token este activo el usuario pueda entrar directamente a nuestra plataforma sin
            // pasar nuevamente por login. le pasamos el nombre de la etiqueta('auth') y los datos
            // que seran almacenados(auth), pero estos datos deben ser de tipo string, para locual
            //los combertimos con JSON.stringify
            localStorage.setItem("auth", JSON.stringify(auth));
            //como el usuario se logeo correctamente usamos la instancia de nuxt, donde esta el metodo
            //push para redireccionar el usuaria a nuestra plataforma(/dashboard)
            $nuxt.$router.push("/dashboard");

            return;
          }
        })
        .catch((e) => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "User already exists :(",
            });

            return;
          } else {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error creating user...",
            });

            return;
          }
        });
    },
  },
};
</script>

<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
