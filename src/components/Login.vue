<template>
  <div class="centered">
    <h1 class="title is-5">
      Please login with Microsoft Identity Platform
    </h1>
    <button class="button is-dark is-large" @click="doLogin">
      Sign in with Microsoft <img class="ml-4" src="../assets/mssymbol.svg" alt="MS logo">
    </button>
    <p class="mt-4">
      Note. You can login with a 'work &amp; school' or personal Microsoft account
    </p>

    <div v-if="error" class="notification is-warning mt-4">
      {{ error }}
    </div>
  </div>
</template>

<script>
import auth from '../services/auth'

export default {

  data: function() {
    return {
      error: ''
    }
  },

  methods: {
    async doLogin() {
      try {
        await auth.login()
        this.$emit('loginComplete')
      } catch (err) {
        this.error = err.toString()
      }
    }
  }
}
</script>

<style scoped>
  .centered {
    text-align: center;
  }
</style>