<template>
  <div id="app">
    <h1 class="title">
      Graph API - Directory Lookup
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

    <p v-if="token" class="control has-icons-left">
      <input v-model="search" class="input is-success is-rounded has-icons-left" style="width: 20rem">
      <span class="icon is-small is-left">
        <i class="fas fa-search" />
      </span>
    </p>

    <table v-if="results && !error" class="table is-striped is-hoverable">
      <thead>
        <tr>
          <th>Display Name</th><th>Names</th><th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in results" :key="user.id" @click="selectUser(user)">
          <td>{{ user.displayName }}</td><td>{{ user.givenName }} {{ user.surname }}</td><td>{{ user.mail }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="selectedUser" class="modal is-active">
      <div class="modal-background " />
      <div class="modal-card">
        <header class="modal-card-head has-background-info">
          <p class="modal-card-title has-text-light">
            <i class="fa fa-user fa-fw" /> User Details
          </p>
          <button class="delete" aria-label="close" @click="selectedUser=null" />
        </header>
        <section class="modal-card-body">
          <pre>
{{ selectedUser }}
          </pre>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="selectedUser=null">
            OK
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import * as msal from 'msal'
import axios from 'axios'
import _ from 'lodash'

const msalApp = new msal.UserAgentApplication({
  auth: {
    clientId: process.env.VUE_APP_CLIENT_ID,
    redirectUri: window.location.origin,

  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true
  }
})
const accessTokenRequest = { scopes: ['User.Read', 'User.ReadBasic.All'] }

export default {
  name: 'App',

  data: function() {
    return {
      results: null,
      search: null,
      token: null,
      error: null,
      selectedUser: null
    }
  },

  watch: {
    // Watch the search field and run a Graph search with a debounce
    search(newVal) {
      if (newVal.trim()) { this.searchDebounce(newVal) }
    }
  },

  async mounted() {
    if (!process.env.VUE_APP_CLIENT_ID || process.env.VUE_APP_CLIENT_ID == 'CHANGE_ME') {
      this.error = 'VUE_APP_CLIENT_ID has not been configured!'
      return
    }

    // Try to reuse cached user
    let tokenResp = await msalApp.acquireTokenSilent(accessTokenRequest)
    if (tokenResp) {
      console.log('### MSAL acquireTokenSilent was successful')
      this.token = tokenResp.accessToken
    }
  },

  methods: {
    selectUser(user) {
      this.selectedUser = user
    },

    // Lodash debounce wrapper around the HTTP call to the Graph
    searchDebounce: _.debounce(async function(searchString) {
      // Just in case
      if (!this.token) { return }

      // Construct Graph query
      try {
        let resp = await axios.get(`https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName, '${searchString}') or startswith(userPrincipalName, '${searchString}')`,
          {
            headers: { Authorization: `Bearer ${this.token}` }
          })

        // Update results with data returned
        if (resp && resp.data && resp.data.value) {
          this.results = resp.data.value
        } else {
          this.error = 'Graph call failed, no data returned'
        }
      } catch (err) {
        this.error = err.toString()
      }
    }, 200),

    // Log user in with MSAL and Azure AD
    async login() {
      let tokenResp = null
      // 1. Login with popup
      await msalApp.loginPopup({ scopes: [ 'user.read' ], prompt: 'select_account' })
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

  tr {
    cursor: pointer;
  }
</style>