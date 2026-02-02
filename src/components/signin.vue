<script setup lang="ts">
import { computed, ref } from 'vue'
import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')

const authData = ref(pb.authStore.record)
let otpId = ''
const email = ref('')
const password = ref('')
const loading = ref(false)
const otpRequested = ref(false)

const isPasswordValid = computed(() => {
  return /.{12,}|[0-9]{8}/.test(password.value)
})

async function requestOtp() {
  if (!email.value) return
  loading.value = true
  const result = await pb.collection('users').requestOTP(email.value, {
    query: { locale: navigator.language }
  })
  otpRequested.value = true
  otpId = result.otpId
  loading.value = false
}

async function verifyOtp() {
  loading.value = true
  authData.value = (await pb.collection('users').authWithOTP(otpId, password.value)).record
  console.log(authData.value)
  
  loading.value = false
}

async function signInWithPassword() {
  if (!email.value || !password.value) return
  loading.value = true
  authData.value = (await pb.collection("users").authWithPassword(email.value, password.value)).record
  loading.value = false
}

function signin() {
  setTimeout(() => {
    if (!password.value) requestOtp()
    else if (password.value.length === 8) verifyOtp()
    else signInWithPassword()
  }, 100) // wait for paste event to complete
}
</script>

<template>
  <div>
    <h1>Sign In</h1>
    <form @submit.prevent="signin">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        :disabled="loading"
        autocomplete="username"
      >
      <br>
      <label for="password">Password or code</label>
      <input
        id="password"
        v-model="password"
        type="password"
        :disabled="loading"
        autocomplete="current-password"
        pattern=".{12,}|[0-9]{8}"
        @paste="signin"
      >
      <p v-if="password && !isPasswordValid"">
        The password must be at least 12 characters long or be the code that you received.
      </p>
      <br>
      <button
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Signing in...' : password ? 'Sign In' : 'Request Code' }}
      </button>
      <p v-if="otpRequested">Code sent to {{ email }}</p>
    </form>
    <button
      v-if="authData"
      @click="pb.authStore.clear();authData = null"
    >
      Sign out
    </button>
  </div>
</template>
