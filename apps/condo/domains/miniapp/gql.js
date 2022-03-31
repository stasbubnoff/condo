/**
 * Generated by `createservice miniapp.AllOrganizationAppsService --type queries`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const APP_FIELDS = '{ id name shortDescription connected type category logo }'
 
const ALL_MINI_APPS_QUERY = gql`
    query getAllMiniApps ($data: AllMiniAppsInput!) {
        objs: allMiniApps (data: $data) ${APP_FIELDS}
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    ALL_MINI_APPS_QUERY,
/* AUTOGENERATE MARKER <EXPORTS> */
}
