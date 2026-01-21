<script setup lang="ts">
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

pb.collection('files').getList(1, 20, {
  filter: 'created > "2022-08-01 10:00:00"'
}).then((result) => console.log(result))
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
