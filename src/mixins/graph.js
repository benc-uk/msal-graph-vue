// ----------------------------------------------------------------------------
// Copyright (c) Ben Coleman, 2020
// Licensed under the MIT License.
//
// Set of methods to call the Graph API, using REST and fetch
// ----------------------------------------------------------------------------

const GRAPH_BASE = 'https://graph.microsoft.com/beta'

export default {
  methods: {
    //
    // Get details of user, and return as JSON
    // https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http#response-1
    //
    graphGetSelf: async function (accessToken) {
      let meResp = await fetch(
        `${GRAPH_BASE}/me`,
        {
          headers: { authorization: `bearer ${accessToken}` }
        }
      )
      if (!meResp.ok) { throw new Error(`Graph call to ${GRAPH_BASE}/me failed ${meResp.statusText}`) }
      let data = await meResp.json()
      return data
    },

    //
    // Get user's photo and return as a blob object URL
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
    //
    graphGetPhoto: async function (accessToken) {
      let photoResp = await fetch(
        `${GRAPH_BASE}/me/photos/240x240/$value`,
        {
          headers: { authorization: `bearer ${accessToken}` }
        }
      )
      if (!photoResp.ok) { throw new Error(`Graph call to ${GRAPH_BASE}/me/photo/$value failed ${photoResp.statusText}`) }
      let blob = await photoResp.blob()
      return URL.createObjectURL(blob)
    },

    //
    // Search for users
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
    //
    graphSearchUsers: async function (searchString, accessToken, max = 50) {
      let url = `${GRAPH_BASE}/users?$filter=startswith(displayName, '${searchString}') or startswith(userPrincipalName, '${searchString}')&$top=${max}`

      let searchResp = await fetch(
        url,
        {
          headers: { authorization: `bearer ${accessToken}` }
        }
      )
      if (!searchResp.ok) { throw new Error(`Graph call to '${url}' failed with '${searchResp.statusText}'`) }
      let data = await searchResp.json()
      return data
    }
  }
}