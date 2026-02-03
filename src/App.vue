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

const updateFile = async (recordId: string, event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    const formData = new FormData()
    formData.append('file', input.files[0]!)
    
    // Note: If updating a 'files' (array) field, the behavior depends on PocketBase version.
    // Usually, it appends or replaces. For single 'file' field, it replaces.

    const record = await pb.collection('files').update(recordId, formData)
    console.log('File updated:', record)
    await fetchFiles()
    
    // Reset input value so change event triggers again if same file selected
    input.value = '' 
  } catch (err) {
    console.error('Update failed:', err)
  }
}
</script>

<template>
  <h1>You did it!</h1>
  <div style="margin-bottom: 2rem;">
    <h3>Upload New File</h3>
    <input type="file" multiple @change="uploadFile" />
  </div>

  <div v-if="files.length" style="margin-top: 20px;">
    <h2>Uploaded Files:</h2>
    <ul>
      <li v-for="record in files" :key="record.id">
        <div v-if="record.file">
          <strong>Single File:</strong>
          <a :href="getFileUrl(record, record.file)" target="_blank">{{ record.file }}</a>
          <!-- Update Input -->
          <label style="margin-left: 10px; cursor: pointer; border: 1px solid #ccc; padding: 2px 5px;">
            Update
            <input type="file" style="display: none;" @change="(e) => updateFile(record.id, e)" />
          </label>
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
