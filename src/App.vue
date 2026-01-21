<script setup lang="ts">
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

pb.collection('files').getList(1, 20, {
  filter: 'created > "2022-08-01 10:00:00"'
}).then((result) => console.log(result))

const uploadFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    const formData = new FormData()
    formData.append('file', input.files[0]!)
    for (let file of input.files) {
      formData.append('files', file);
    }
    
    const record = await pb.collection('files').create(formData)
    console.log('File uploaded:', record)
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
</script>

<template>
  <h1>You did it!</h1>
  <input type="file" multiple @change="uploadFile" />
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
