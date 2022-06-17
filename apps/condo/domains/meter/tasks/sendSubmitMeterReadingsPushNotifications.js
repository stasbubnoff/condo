const pino = require('pino')
const dayjs = require('dayjs')
const { get, uniq, isNull } = require('lodash')
const falsey = require('falsey')

const conf = require('@core/config')
const { getSchemaCtx } = require('@core/keystone/schema')

const { loadListByChunks } = require('@condo/domains/common/utils/serverSchema')
const { COUNTRIES, DEFAULT_LOCALE } = require('@condo/domains/common/constants/countries')

const { Meter, MeterReading, MeterResource } = require('@condo/domains/meter/utils/serverSchema')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')

const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const {
    METER_SUBMIT_READINGS_REMINDER_TYPE,
    METER_VERIFICATION_DATE_EXPIRED_TYPE,
} = require('@condo/domains/notification/constants/constants')

const { rightJoin, joinResidentsToMeters } = require('@condo/domains/meter/tasks/sendVerificationDateReminder')

const logger = pino({
    name: 'submit_meter_readings_notifications',
    enabled: falsey(process.env.DISABLE_LOGGING),
})

const log = (message, intentChar = null, intentRepeatTimes = 10) => {
    const logEntry = isNull(intentChar) ? message
        : `${ intentChar.repeat(intentRepeatTimes) } ${ message } ${ intentChar.repeat(intentRepeatTimes) }`

    logger.info({
        message: logEntry,
    })
}

const readMetersPage = async ({ context, offset, pageSize }) => {
    return await Meter.getAll(
        context, {}, {
            sortBy: 'id_ASC',
            first: pageSize,
            skip: offset,
        }
    )
}

const readMeterReadings = async ({ context, meters }) => {
    // first step is get unique meter ids
    const meterIds = uniq(meters.map(meter => meter.id))

    // then calculate current period window
    const now = dayjs()
    const startWindowDate = `${ now.format('YYYY-MM') }-01`
    const endWindowDate = now.toISOString()

    // load all pages for entity
    return await loadListByChunks({
        context,
        list: MeterReading,
        where: {
            date_gte: startWindowDate,
            date_lte: endWindowDate,
            meter: {
                id_in: meterIds,
            },
        },
    })
}

const readOrganizations = async ({ context, meters }) => {
    // first step is get unique organizations ids
    const organizationIds = uniq(meters.map(meter => meter.organization.id))

    // load all pages for entity
    return await loadListByChunks({
        context,
        list: Organization,
        where: {
            id_in: organizationIds,
        },
    })
}

const getLocalizedMeterResources = async ({ context, lang }) => {
    // get context for specific locale
    const localeDependedContext = {
        ...context.createContext({ skipAccessControl: true }),
        req: { locale: lang },
    }

    // get list of meter resources for certain locale
    // TODO apply DOMA-3174 mechanic for custom request locale
    return await loadListByChunks({
        context,
        list: MeterResource,
        where: {},
    })
}

const loadAllLocalizedVersionsOfMeterResources = async ({ context }) => {
    const supportedLanguages = ['en', 'ru']
    const result = {}

    for (let supportedLanguage of supportedLanguages) {
        result[supportedLanguage] = await getLocalizedMeterResources({ context, lang: supportedLanguage })
    }

    return result
}

const sendSubmitMeterReadingsPushNotifications = async () => {
    // task implementation algorithm
    // * Read all meter resources for all supported languages
    // * Read meters page
    // * Read meter readings (from 01 day of month to now) for meters above
    // * Read meter organisation for meters above
    // * Right join readings/organisation/resources to meters
    // * Filter meters without readings
    // * Filter meters without organisation default period
    // * Join residents to rest of meters
    // * Send message with specific unique key for set up readings (key is: {meterId}_{residentId}_{now().minusMonth().format(YYYY_MM)})
    // * Filter meters with expired next verification date
    // * Send message with specific unique key for expired verification (key is: {meterId}_{residentId}_{now().minusMonth().format(YYYY_MM)})
    // * Print some stat

    log('Start sending submit meter notifications', '=')
    // initialize context stuff
    const { keystone: context } = await getSchemaCtx('Meter')
    const resourcesLocalizations = await loadAllLocalizedVersionsOfMeterResources({ context })

    // let's load meters page by page
    const state = {
        pageSize: 100,
        offset: 0,
        hasMore: true,
        processedMeters: 0,
        processedPages: 0,
        metersWithoutReadings: 0,
        metersWithoutReadingsAndWithResidents: 0,
        metersWithExpiredVerificationDate: 0,
        startTime: dayjs(),
    }
    log(`Start proceeding meters page by page ${ state.startTime }`, '-')

    do {
        // log each 10 pages
        if (state.processedPages % 10 === 0) {
            log(`Processing page ${ state.processedPages + 1 }`)
        }

        // read all required data
        const meters = await readMetersPage({
            context,
            offset: state.offset,
            pageSize: state.pageSize,
        })
        const meterReadings = await readMeterReadings({ context, meters })
        const organizations = await readOrganizations({ context, meters })

        // right join data to metersPage
        const metersWithoutReadings = rightJoin(
            meters,
            meterReadings,
            (meter, item) => meter.id === item.meter.id,
            (meter, readings) => ({ meter, readings })
        )
            .filter(({ readings }) => readings.length === 0)
            .map(({ meter }) => meter)

        // right join organizations
        const metersWithoutPeriod = rightJoin(
            metersWithoutReadings,
            organizations,
            (meter, organization) => meter.organization.id === organization.id,
            (meter, organization) => {
                /**
                 * Detect message language
                 * Use DEFAULT_LOCALE if organization.country is unknown
                 * (not defined within @condo/domains/common/constants/countries)
                 */
                const lang = get(COUNTRIES, get(organization, 'country.locale'), DEFAULT_LOCALE)
                const period = null // TODO calculate this prop after implementation submit period in organisation
                return { ...meter, period, lang }
            }
        ).filter(({ period }) => period == null) // pick meters without organisation default period
        state.metersWithoutReadings += metersWithoutPeriod.length

        // Join residents
        const metersWithResident = await joinResidentsToMeters({ context, meters: metersWithoutPeriod })
        state.metersWithoutReadingsAndWithResidents += metersWithResident.length

        // Send message with specific unique key for set up readings
        await sendMessagesForSetUpReadings({
            context, metersWithResident,
        })

        // Filter meters with expired next verification date
        const expiredVerificationMetersWithResident = metersWithResident.filter(({ meter }) => {
            const nextVerificationDate = dayjs(meter.nextVerificationDate)
            return dayjs().unix() >= nextVerificationDate.unix()
        })
        state.metersWithExpiredVerificationDate += expiredVerificationMetersWithResident.length

        // Send message with specific unique key for expired verification
        await sendMessagesForExpiredMeterVerificationDate({
            context, resourcesLocalizations, metersWithResident: expiredVerificationMetersWithResident,
        })

        // check if we have more pages
        state.hasMore = meters.length > 0
        state.processedMeters += meters.length
        state.offset += state.pageSize
        state.processedPages++
    } while (state.hasMore)

    // some stat
    log(`End proceeding meters ${ dayjs() }`, '-')
    log('Processing stats', '-')
    log(`Processed pages = ${ state.processedPages }`)
    log(`Meters per page = ${ state.pageSize }`)
    log(`Meters without readings, without default submit period = ${ state.metersWithoutReadings }`)
    log(`Meters without readings, without default submit period, with residents = ${ state.metersWithoutReadingsAndWithResidents }`)
    log(`Meters without readings, without default submit period, with residents, with expired verification date = ${ state.metersWithExpiredVerificationDate }`)
    log(`Meters total = ${ state.processedMeters }`)
    log(`Processing time = ${ (dayjs().unix() - state.startTime.unix()) } sec`)
    log('Processing completed!', '=')
}

const sendMessageSafely = async ({ context, message }) => {
    try {
        await sendMessage(context, message)
    } catch (e) {
        // do nothing to handle duplicates error
    }
}

const sendMessagesForSetUpReadings = async ({ context, metersWithResident }) => {
    await Promise.all(metersWithResident.map(async ({ meter, residents }) => {
        await Promise.all(residents.map(async (resident) => {
            const { lang } = meter
            const uniqKey = `${ meter.id }_${ resident.id }_${ dayjs().format('YYYY-MM') }`

            const message = {
                sender: { dv: 1, fingerprint: 'meters-readings-submit-reminder-cron-push' },
                to: { user: { id: resident.user.id } },
                type: METER_SUBMIT_READINGS_REMINDER_TYPE,
                lang,
                uniqKey,
                meta: {
                    dv: 1,
                    data: {
                        meterId: meter.id,
                        userId: resident.user.id,
                        residentId: resident.id,
                        url: `${ conf.SERVER_URL }/meter/`,
                    },
                },
            }

            await sendMessageSafely({ context, message })
        }))
    }))
}

const sendMessagesForExpiredMeterVerificationDate = async ({ context, resourcesLocalizations, metersWithResident }) => {
    await Promise.all(metersWithResident.map(async ({ meter, residents }) => {
        await Promise.all(residents.map(async (resident) => {
            const { lang } = meter
            const uniqKey = `${ meter.id }_${ resident.id }_${ dayjs().format('YYYY-MM') }`
            const resourceId = get(meter, 'resource.id', '')
            const localizedResource = resourcesLocalizations[lang].find(resource => resource.id === resourceId)
            const localizedResourceName = get(localizedResource, 'name', '')

            const message = {
                sender: { dv: 1, fingerprint: 'meters-readings-submit-reminder-cron-push' },
                to: { user: { id: resident.user.id } },
                type: METER_VERIFICATION_DATE_EXPIRED_TYPE,
                lang,
                uniqKey,
                meta: {
                    dv: 1,
                    data: {
                        meterId: meter.id,
                        resource: { name: localizedResourceName },
                        userId: resident.user.id,
                        residentId: resident.id,
                        url: `${ conf.SERVER_URL }/meter/`,
                    },
                },
            }

            await sendMessageSafely({ context, message })
        }))
    }))
}

module.exports = {
    sendSubmitMeterReadingsPushNotifications,
}