<template>
  <div id="app">
    <h1 class="title">
      Search the Graph API
    </h1>

    <article v-if="error" class="message is-danger">
      <div class="message-header">
        <p><i class="fas fa-exclamation-circle" /> Error 😢</p>
        <button class="delete" aria-label="delete" />
      </div>
      <div class="message-body">
        {{ error }}
      </div>
    </article>

    <button v-if="!token && !error" class="button is-info" @click="login">
      LOGIN <i class="fas fa-user fa-fw" />
    </button>

    <p v-if="token && !error" class="control has-icons-left">
      <input v-model="search" class="input is-success is-rounded has-icons-left" style="width: 20rem">
      <span class="icon is-small is-left">
        <i class="fas fa-search" />
      </span>
    </p>

    <table v-if="results && !error" class="table is-striped is-hoverable">
      <thead>
        <tr>
          <th>UPN</th><th>Display Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in results" :key="index">
          <td>{{ user.userPrincipalName }}</td><td>{{ user.displayName }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as msal from 'msal'
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'App',

  data: function() {
    return {
      results: null,
      search: '',
      token: null,
      error: ''
    }
  },

  watch: {
    // Watch the search field and run a Graph search with a debounce
    search(newVal) {
      if (newVal.trim()) { this.searchDebounce(newVal) }
    }
  },

  mounted() {
    if (!process.env.VUE_APP_CLIENT_ID || process.env.VUE_APP_CLIENT_ID == 'CHANGE_ME') {
      this.error = 'VUE_APP_CLIENT_ID has not been configured!'
      return
    }
  },

  methods: {
    // Lodash debounce wrapper around the HTTP call to the Graph
    searchDebounce: _.debounce(async function(searchString) {
      // Just in case
      if (!this.token) { return }

      // Construct Graph query
      let resp = await axios.get(`https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${searchString}') or startswith(userPrincipalName, '${searchString}')`, {
        headers: { Authorization: `Bearer ${this.token}` }
      })

      // Update results with data returned
      if (resp && resp.data && resp.data.value) {
        this.results = resp.data.value
      }
    }, 200),

    // Log user in with MSAL and Azure AD
    async login() {
      let loginRequest = { scopes: [ 'user.read' ], prompt: 'select_account' }
      let accessTokenRequest = { scopes: ['User.Read', 'User.ReadBasic.All'] }
      let tokenResp = null

      // Configure MSAL app
      let msalApp = new msal.UserAgentApplication({
        auth: {
          clientId: process.env.VUE_APP_CLIENT_ID,
          redirectUri: window.location.origin
        }
      })

      // 1. Login with popup
      await msalApp.loginPopup(loginRequest)
      console.log('### MSAL loginPopup was successful')
      try {
        // 2. Try to aquire token silently
        tokenResp = await msalApp.acquireTokenSilent(accessTokenRequest)
        console.log('### MSAL acquireTokenSilent was successful')
      } catch (tokenErr) {
        // 3. Silent process might have failed so try via popup
        tokenResp = await msalApp.acquireTokenPopup(accessTokenRequest)
        console.log('### MSAL acquireTokenPopup was successful')
      }

      // Store access token in state
      if (tokenResp) {
        this.token = tokenResp.accessToken
      } else {
        this.error = `Failed to get access token ${JSON.stringify(tokenResp)}`
      }
    }
  }
}
</script>

<style>
body {
  padding: 1rem;
}
</style>