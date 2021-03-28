# MSAL & Microsoft Graph - Vue.js

This project consists of two things:

- A sample Vue.js application.
- Drop in helper modules for MSAL.js and Microsoft Graph. [See docs below](#using-as-a-drop-in-library)

The sample app is an example of using [MSAL for JS v2](https://github.com/AzureAD/microsoft-authentication-library-for-js) to authenticate against [Azure AD from a single page JS application](https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-spa).  
After signing in, an access token is requested and used to query the [Microsoft Graph API](https://developer.microsoft.com/en-us/graph)

This uses the newer MSAL.js 2.0+ library which supports the authorization code flow with PKCE for single page apps, and not the older implicit flow.

The app provides demonstration of some fundamental use cases:

- Signing in users from a single page application (SPA)
- Login, logout, user account caching
- Requesting and using scoped access tokens
- Calling the Microsoft Graph API
- Searching the Microsoft Graph with OData

![screen shot](https://user-images.githubusercontent.com/14982936/87789050-4931a180-c836-11ea-8c97-16b1c7e19895.png)

This app only uses `User.Read` and `User.ReadBasic.All` permissions in the Graph, so does not require admin consent

The use of a registered _multi-tenant application_ and the v2 Azure AD 'common' endpoint is assumed, but single tenanted apps would also work

Note. The MSAL library is used directly rather than any Vue specific wrapper, as there's enough layers of abstraction to deal with as it is, without one more

# Set Up & Deployment

### Pre-reqs - Register app in Azure AD

Using the Azure CLI create the new app registration

```
az ad app create --display-name="Graph Demo App" \
--available-to-other-tenants=true \
--query "appId" -o tsv
```

Make a note of the GUID returned, this is the app ID, or client ID

Follow the guide here to further configure the app, this currently can't be done from the CLI  
https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration#redirect-uri-msaljs-20-with-auth-code-flow

Quick summary of the steps:

- Click 'Authentication'
  - UNSELECT the checkbox 'ID tokens (used for implicit and hybrid flows)'
  - Click 'Add a platform'
    - Click 'Single page application'
    - Enter `http://localhost:8080` as the redirect URI

Copy `.env.local.sample` to `.env.local` and place the app ID in the setting `VUE_APP_CLIENT_ID`

### Docker

There is a Dockerfile to build the app and serve it via NGINX. The Azure AD client ID needs to be set at build time (as this is a Vue.js app)

Run from root of project, and set CLIENT_ID and image tag as required

```bash
docker build . -f deploy/Dockerfile --build-arg CLIENT_ID="CHANGE_ME" -t msal-graph-vue
```

# Running Locally

This project was created with [the Vue CLI](https://cli.vuejs.org/)

## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run serve
```

Local server runs on `http://localhost:8080` by default

### Compiles and minifies for production

```bash
npm run build
```

### Lint code with ESLint

```bash
npm run lint
```

# Using as a drop in library

The `src/services/auth.js` and `src/services/graph.js` files are ES6 modules and have been written to be as reusable as possible, so can be copied and dropped into any SPA project.

## auth.js

This is a fairly opinionated wrapper around MSAL.js 2.0 providing methods for configuring MSAL, login, logout, acquiring tokens etc. It also supports a special 'dummy user mode' where MSAL has been stubbed for when you want your app to optionally support user auth e.g. demos and test environments.

### Setup

First call `configure()` this accepts the Azure AD clientId you wish to use, the second parameter is to enable/disable dummy user mode, dummy user mode is only switch on if clientId is null or empty

Call this once as your app is initialized.

```js
import auth from './services/auth'

// Example of getting client id, there might be other mechanisms you want to use to fetch this value
const clientId = process.env.VUE_APP_CLIENT_ID

// Set up auth helper with dummy user disabled
auth.configure(clientId, false)

// Set up auth helper with dummy user enabled, it's only enabled when clientId is undefined/blank
//auth.configure(clientId, true)
```

### Method Reference

- `configure(clientId, enableDummyUser)` - Configure and setup the helper
- `login(scopes)` - Prompt user to login, scopes parameter is optional, the defaults are: `user.read, openid, profile, email`
- `logout()` - Perform a full logout.
- `user()` - Get the current user, returns the [MSAL AccountInfo object](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_common.html#accountinfo).
- `acquireToken(scopes)` - Attempt to get an access token, silent is called first, then pop-up if that fails. The access token as a string is returned.
- `clearLocal()` - Clear local cache, use for a 'shallow' local only logout.
- `isConfigured()` - Returns if the helper is configured .
- `clientId()` - Returns the clientId used to configure the helper.

## graph.js

This is a helper for calling the Microsoft Graph, it requires `auth.js` which has been setup and configured previous to any calls to this library. This is a thin wrapper around the beta Graph endpoint `https://graph.microsoft.com/beta` endpoint, and it silently acquires tokens for you.

> Note. It requests an access token with the `user.readbasic.all` scope, in order to search the directory, this scope does NOT require the application to have admin consent.

### Method Reference

- `getSelf()` - Calls the `/me` endpoint to get details of the currently signed in user. [See Graph docs](https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-beta&tabs=http)
- `getPhoto()` - Returns the current user's photo as a blob object.
- `searchUsers(searchString, maxResults)` - Search the directory for users, looks in the _displayName_ and _userPrincipalName_ fields, by default returns 50 results.
- `getAccessToken()` - Returns the current accesstoken in use.
