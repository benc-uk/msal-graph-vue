# Graph Search Demo SPA
Simple demo of using [MSAL for JS](https://github.com/AzureAD/microsoft-authentication-library-for-js) to authenticate against [Azure AD from a single page JS application](https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-spa).  
After signing in, an access token is requested and used to query the [Microsoft Graph API](https://developer.microsoft.com/en-us/graph)

**Note 1.** This demo only uses `User.Read` and `User.ReadBasic.All` permissions in the Graph, so does not require admin consent  
**Note 2.** This demo requires the use of a registered *multi-tenant application* and the v2 Azure AD 'common' endpoint

## Register an app in Azure AD

Using the Azure CLI
```
az ad app create --display-name="Graph Demo App" \
--oauth2-allow-implicit-flow=true \
--reply-urls="http://localhost:9000" \
--available-to-other-tenants=true \
--query "appId" -o tsv
```
Make a note of the GUID returned, this is the app ID

Copy `.env.local.sample` to `.env.local` and place the app ID in the setting `VUE_APP_CLIENT_ID`

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
