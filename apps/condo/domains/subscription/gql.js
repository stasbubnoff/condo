/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const { SBBOL_OFFER_ACCEPT_FIELD_QUERY_LIST } = require('./schema/fields/SbbolOfferAcceptField')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const SERVICE_SUBSCRIPTION_FIELDS = `{ type isTrial organization { id } startAt finishAt unitsCount unitPrice totalPrice currency ${COMMON_FIELDS} sbbolOfferAccept { ${SBBOL_OFFER_ACCEPT_FIELD_QUERY_LIST} } }`
const ServiceSubscription = generateGqlQueries('ServiceSubscription', SERVICE_SUBSCRIPTION_FIELDS)

const SERVICE_SUBSCRIPTION_PAYMENT_FIELDS = `{ type status externalId amount currency organization { id } subscription { id } meta statusMeta ${COMMON_FIELDS} }`
const ServiceSubscriptionPayment = generateGqlQueries('ServiceSubscriptionPayment', SERVICE_SUBSCRIPTION_PAYMENT_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    ServiceSubscription,
    ServiceSubscriptionPayment,
/* AUTOGENERATE MARKER <EXPORTS> */
}
