<template>
  <div>
    <!--FORM ADD DEVICE -->
    <div class="row">
      <!-- Esta es la tarjeta -->
      <card>
        <div slot="header">
          <!-- En el encabezado agrega el siguiente titulo-->
          <h4 class="card-title">Add new Device</h4>
        </div>
        <!--Creamos una fila con tres campos -->
        <div class="row">
          <!-- Primera columna-->
          <div class="col-4">
            <base-input
              label="Device Name"
              type="text"
              placeholder="Ex: Home, Office..."
              v-model="newDevice.name"
            ></base-input>
          </div>

          <!-- Segunda columna-->
          <div class="col-4">
            <base-input
              label="Device Id"
              type="text"
              placeholder="Ex: 7777-8888"
              v-model="newDevice.dId"
            ></base-input>
          </div>

          <!-- Tercera columna-->
          <div class="col-4">
            <slot name="labele">
              <label> Template </label>
            </slot>
            <!-- lista desplegable para seleccionar -->
            <el-select
              v-model="selectedIndexTemplate"
              placeholder="Select Template"
              class="select-primary"
              style="width: 100%"
            >
              <!-- el v-for que sigue recorre y visualiza todos los templates que tiene el usuario y los 
              visualiza en el desplegable template. Los : en key, value y label indican que el valor es 
              de una variable, sin los dos puntos se imprime el string-->
              <el-option
                v-for="(template, index) in templates"
                :key="template._id"
                class="text-dark"
                :value="index"
                :label="template.name"
              ></el-option>
            </el-select>
          </div>
        </div>

        <!-- creamos un boton para adicionar el dispositivo -->
        <div class="row pull-right">
          <div class="col-12">
            <base-button
              @click="createNewDevice()"
              type="primary"
              class="mb-3"
              size="lg"
              >Add</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- DEVICE TABLE -->
    <div class="row">
      <!-- Esta es la tarjeta -->
      <card>
        <div slot="header">
          <h4 class="card-title">Device</h4>
        </div>
        <!-- con los dos puntos le decimos a la tabla que la info la debe busca abajo, no la pasamos directo. -->
        <el-table :data="$store.state.devices">
          <el-table-column label="#" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>
          <el-table-column prop="name" label="Name"></el-table-column>
          <el-table-column prop="dId" label="Device Id"></el-table-column>
          <el-table-column
            prop="templateName"
            label="Template"
          ></el-table-column>
          <el-table-column label="Actions">
            <!-- cuando tenga que usar boton de borrado debe saber cual objeto del array debo borrar. -->
            <!-- row indica la fila e index indica el nuro de recorrido del arreglo -->
            <div slot-scope="{ row, $index }">
              <!-- {{row.saverRule}}  visualiza el estado de la variable en la pagina para debug. -->
              <el-tooltip
                content="Saver Status Indicator"
                style="margin-right: 10px"
              >
                <i
                  class="fas fa-database"
                  :class="{
                    'text-success': row.saverRule.status,
                    'text-dark': !row.saverRule.status,
                  }"
                ></i>
              </el-tooltip>
              <!-- con esto visualizo en la pantalla en la celda del boton, toda la info de la fila.
              {{row.name}}  -->
              <!-- el-tooltip es el contenido de una celda con forma de swich para habilitar salvar datos en una
              base de nuestro dispositivo -->
              <el-tooltip content="Database Saver">
                <base-switch
                  @click="updateSaverRuleStatus(row.saverRule)"
                  :value="row.saverRule.status"
                  type="primary"
                  on-text="On"
                  off-text="Off"
                ></base-switch>
              </el-tooltip>
              <!-- el-tooltip es el contenido de una celda con forma de boton de borrado -->
              <el-tooltip
                content="Delete"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  type="danger"
                  icon
                  size="sm"
                  class="btn_link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </card>
    </div>

    <!-- <pre>  la etiqueta pre organiza lo que se va a imprimir en pantalla 
      {{devices}}
    </pre> -->
    <!-- <Json :value="templates"></Json>    visualiza codigo al final de la pagina de devices -->
    <Json :value="$store.state.devices"></Json>
  </div>
</template>

<script>
//Se traen los componentes que se usan arriba
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";

export default {
  middleware: "authenticated", //con este cargamos el token que tenemos en el dd
  // esto es como una instacia local de los compo, sino no se pueden usar.
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  // localizacion de las variables.
  data() {
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice: {
        name: "",
        dId: "",
        templateId: "",
        templateName: "",
      },
    };
  },

  mounted() {
    // una vez se carge la pagina llamamos la funcion getDevices para que el usuario tenga la lista
    // de sus dispositivos.
    //la funcion getDevices() esta en store/index en la accion getDevices
    this.$store.dispatch("getDevices");
    this.getTemplates();
  },
  // declaracion de metodos o funciones.
  methods: {
    updateSaverRuleStatus(rule) {
      var ruleCopy = JSON.parse(JSON.stringify(rule));
      ruleCopy.status = !ruleCopy.status;
      const toSend = { rule: ruleCopy };
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      this.$axios
        .put("/saver-rule", toSend, axiosHeaders)
        .then((res) => {

          if (res.data.status == "success") {
            this.$store.dispatch("getDevices"); 
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: " Device Saver Status Updated",
            });
          }
          return;
        })
        .catch((e) => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
             message: " Error updating saver rule status"
          });
          return;
        });
    },
    deleteDevice(device) {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.accessToken,
        },
        params: {
          dId: device.dId,
        },
      };
      this.$axios
        .delete("/device", axiosHeaders)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!",
            });
          }
          $nuxt.$emit("time-to-get-devices");
          return;
        })
        .catch((e) => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name,
          });
          return;
        });
    },
    //new device
    createNewDevice() {
      if (this.newDevice.name == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device Name is Empty :(",
        });
        return;
      }
      if (this.newDevice.dId == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device ID is Empty :(",
        });
        return;
      }
      if (this.selectedIndexTemplate == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Tempalte must be selected",
        });
        return;
      }

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      //ESCRIBIMOS EL NOMBRE Y EL ID DEL TEMPLATE SELECCIONADO EN EL OBJETO newDevice
      this.newDevice.templateId = this.templates[
        this.selectedIndexTemplate
      ]._id;
      this.newDevice.templateName = this.templates[
        this.selectedIndexTemplate
      ].name;
      const toSend = {
        newDevice: this.newDevice,
      };
      this.$axios
        .post("/device", toSend, axiosHeaders)
        .then((res) => {
          if (res.data.status == "success") {
            this.$store.dispatch("getDevices");
            this.newDevice.name = "";
            this.newDevice.dId = "";
            this.selectedIndexTemplate = null;
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Device was added",
            });
            return;
          }
        })
        .catch((e) => {
          if (
            e.response.data.status == "error" &&
            e.response.data.error.errors.dId.kind == "unique"
          ) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message:
                "The device is already registered in the system. Try another device",
            });
            return;
          } else {
            this.showNotify("danger", "Error");
            return;
          }
        });
    },
    //Get Templates
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      try {
        const res = await this.$axios.get("/template", axiosHeaders);
        console.log(res.data);
        if (res.data.status == "success") {
          this.templates = res.data.data;
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error getting templates...",
        });
        console.log(error);
        return;
      }
    },

    deleteDevice(device) {
      // alert("DELETING " + device.name);
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          dId: device.dId,
        },
      };

      this.$axios
        .delete("/device", axiosHeader)
        .then((res) => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!",
            });
            this.$store.dispatch("getDevices");
          }
        })
        .catch((e) => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name,
          });
        });
    },      
  },
};
</script>
