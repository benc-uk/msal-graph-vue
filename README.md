# MSAL & Microsoft Graph - Vue.js Sample
Simple demo of using [MSAL for JS v1](https://github.com/AzureAD/microsoft-authentication-library-for-js) to authenticate against [Azure AD from a single page JS application](https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-spa).  
After signing in, an access token is requested and used to query the [Microsoft Graph API](https://developer.microsoft.com/en-us/graph)

The app provides demonstration of some fundamental use cases:
- Signing in users from a single page application (SPA)
- Login, logout, user account caching 
- Requesting and using scoped access tokens
- Calling the Microsoft Graph API
- Searching the Microsoft Graph with OData

![screen shot](https://user-images.githubusercontent.com/14982936/87789050-4931a180-c836-11ea-8c97-16b1c7e19895.png)

This app only uses `User.Read` and `User.ReadBasic.All` permissions in the Graph, so does not require admin consent  

The use of a registered *multi-tenant application* and the v2 Azure AD 'common' endpoint is assumed, but single tenanted apps would also work

Note. The MSAL library is used directly rather than any Vue specific wrapper, as there's enough layers of abstraction to deal with as it is, without one more

# Set Up & Deployment

### Pre-reqs - Register app in Azure AD

Using the Azure CLI
```
az ad app create --display-name="Graph Demo App" \
--oauth2-allow-implicit-flow=true \
--reply-urls="http://localhost:9000" \
--available-to-other-tenants=true \
--query "appId" -o tsv
```
Make a note of the GUID returned, this is the app ID, or client ID

Copy `.env.local.sample` to `.env.local` and place the app ID in the setting `VUE_APP_CLIENT_ID`

### Config Env Variables
 - `VUE_APP_CLIENT_ID` - ***Required.*** To be set as described above
 - `VUE_APP_AUTHORITY` - *Optional.* Only set if you want to use B2C or auth against a specific tenant
 - `VUE_APP_VALIDATE_AUTHORITY` - *Optional.* Boolean true/false, default is true
 - `VUE_APP_LOGIN_SCOPES` - *Optional.* Customize the scopes requested at login (idToken)
 - `VUE_APP_TOKEN_SCOPES` - *Optional.* Customize the scopes requested for accessToken

### Docker
There is a Dockerfile to build the app and serve it via NGINX. The Azure AD client ID needs to be set at build time (as this is a Vue.js app)

Run from root of project, and set CLIENT_ID and image tag as required
```bash
docker build . -f deploy/Dockerfile --build-arg CLIENT_ID="CHANGE_ME" -t msal-graph-vue
```

# Local Dev

This project was created with [the Vue CLI](https://cli.vuejs.org/)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
Local server runs on `http://localhost:8080` by default

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
