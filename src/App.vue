<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PocketBase, { type RecordModel } from 'pocketbase'
import Signin from './components/signin.vue'

const pb = new PocketBase('http://127.0.0.1:8090')
const files = ref<RecordModel[]>([])

const STORAGE_URL = 'https://s3.pub2.infomaniak.cloud/object/v1/AUTH_e85d8f34a2a44b2c8f782474423c5f13/test'

const getFileUrl = (record: RecordModel, filename: string) => {
  return `${STORAGE_URL}/${record.collectionId}/${record.id}/${filename}`
}

const fetchFiles = async () => {
  try {
    const result = await pb.collection('files').getList(1, 50, {
      sort: '-created'
    })
    files.value = result.items
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchFiles()
})

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
    await fetchFiles()
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
</script>

<template>
  <h1>You did it!</h1>
  <input type="file" multiple @change="uploadFile" />

  <div v-if="files.length" style="margin-top: 20px;">
    <h2>Uploaded Files:</h2>
    <ul>
      <li v-for="record in files" :key="record.id">
        <div v-if="record.file">
          <strong>Single File:</strong>
          <a :href="getFileUrl(record, record.file)" target="_blank">{{ record.file }}</a>
        </div>
        <div v-if="record.files && record.files.length">
          <strong>Multiple Files:</strong>
          <ul>
            <li v-for="f in record.files" :key="f">
              <a :href="getFileUrl(record, f)" target="_blank">{{ f }}</a>
            </li>
          </ul>
        </div>
        <hr/>
      </li>
    </ul>
  </div>

  <Signin />
</template>

<style scoped></style>
