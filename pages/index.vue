<!--Esta es la pagina que arranca cuando escribimos "localhost:3000" -->
<template>
    <div class="row"><h3></h3>     </div>
</template>

<!--En esta parte redirigiremos aotra pagina,
lo que exportaremos "export default", una vez se monte la pagina "mounted()" llamaremos a la
instancia de nuxt, de la cual usamos al router que gestiona las rutas y este tiene un metodo 
llamado push con el cual le pasamos a donde queremos ir "/dashboard" -->
<script>
export default {
    mounted() {
        $nuxt.$router.push("/dashboard")
    }
    
}
</script>