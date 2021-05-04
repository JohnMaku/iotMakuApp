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
            ></base-input>
          </div>

          <!-- Segunda columna-->
          <div class="col-4">
            <base-input
              label="Device Id"
              type="text"
              placeholder="Ex: J-565-356"
            ></base-input>
          </div>

          <!-- Tercera columna-->
          <div class="col-4">
            <slot name="labele">
              <label> Template </label>
            </slot>
            <!-- lista desplegable para seleccionar -->
            <el-select
              value="1"
              placeholder="Select Template"
              class="select-primary"
              style="width: 100%"
            >
              <el-option
                class="text-dark"
                value="Template 1"
                label="Template 1"
              ></el-option>

              <el-option
                class="text-dark"
                value="Template 2"
                label="Template 2"
              ></el-option>

              <el-option
                class="text-dark"
                value="Template 3"
                label="Template 3"
              ></el-option>
            </el-select>
          </div>
        </div>

        <!-- creamos un boton para adicionar el dispositivo -->
        <div class="row pull-right">
          <div class="col-12">
            <base-button type="primary" class="nb-3" size="lg">Add</base-button>
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
        <el-table :data="devices">
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
              <el-tooltip content="Saver Status Indicator" style="margin-right:10px">
                <i class="fas fa-database " :class="{'text-success' : row.saverRule, 'text-dark' : !row.saverRule}"></i>
              </el-tooltip>
              <!-- con esto visualizo en la pantalla en la celda del boton, toda la info de la fila.
              {{row.name}}  -->
              <!-- el-tooltip es el contenido de una celda con forma de swich para habilitar salvar datos en una
              base de nuestro dispositivo -->
              <el-tooltip class="Database Saver"> 
                <base-switch
                  @click="updateSaverRuleStatus($index)"
                  :value="row.saverRule"
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
            <el-tooltip
              content="Delete"
              effect="light"
              :open-delay="300"
              placement="top"
            >
              <base-button type="danger" icon size="sm" class="btn_link">
                <i class="tim-icons icon-simple-remove"></i>
              </base-button>
            </el-tooltip>
          </el-table-column>
        </el-table>
      </card>
    </div>

    <!-- <pre>  la etiqueta pre organiza lo que se va a imprimir en pantalla 
      {{devices}}
    </pre> -->
    <Json :value="devices"></Json>
  </div>
</template>

<script>
//Se traen los componentes que se usan arriba
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
import JsonColor from "../components/Json.vue";
export default {
  // esto es como una instacia local de los compo, sino no se pueden usar.
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  // localizacion de las variables, como no hemos configurado la API simularemos su respuesta.
  data() {
    return {
      //devices es una variable de tipo array de objetos, llena amano para la prueba.
      devices: [
        {
          name: "Home",
          dId: "8888",
          templateName: "Power Sensor",
          templateId: "21313131313231",
          saverRule: false,
        },
        {
          name: "Office",
          dId: "9999",
          templateName: "Power Term",
          templateId: "15645245615414",
          saverRule: true,
        },
        {
          name: "Farm",
          dId: "7777",
          templateName: "Power dog",
          templateId: "54654156156565",
          saverRule: false,
        },
      ],
    };
  },
  // declaracion de metodos o funciones.
  methods: {
    deleteDevice(device) {
      alert("DELETING " + device.name);
    },
    updateSaverRuleStatus(index) {
      this.devices[index].saverRule = !this.devices[index].saverRule;
    },
  },
};
</script>
