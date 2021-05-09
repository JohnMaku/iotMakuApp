<template>
  <div>
    <h2>Dashboard</h2>
  </div>
</template>

<script>
export default {
  middleware: "authenticated",//con este verificamos que si no esta autenticado lo enviamos login
};
</script>