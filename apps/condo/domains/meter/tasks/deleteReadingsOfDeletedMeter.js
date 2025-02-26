const { getSchemaCtx, find } = require('@open-condo/keystone/schema')
const { createTask } = require('@open-condo/keystone/tasks')
const { MeterReading } = require('../utils/serverSchema')

/**
 * Soft delete meter readings after soft delete meter
 */
async function deleteReadingsOfDeletedMeter (deletedMeter, deletedMeterAt) {
    const { keystone: context } = await getSchemaCtx('Property')

    const meterId = deletedMeter.id
    const meterReadings = await find('MeterReading', {
        meter: { id: meterId },
        deletedAt: null,
    })

    for (const reading of meterReadings) {
        await MeterReading.update(context, reading.id, {
            deletedAt: deletedMeterAt,
            dv: deletedMeter.dv,
            sender: deletedMeter.sender,
        })
    }
}

module.exports = createTask('deleteReadingsOfDeletedMeter', deleteReadingsOfDeletedMeter)
