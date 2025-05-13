import z from 'zod'
import { XpandWorkOrder } from '../../schemas'
import { XpandDbWorkOrder } from '.'

export function trimStrings<T>(data: T): T {
  if (typeof data === 'string') {
    return data.trim() as T
  }

  if (Array.isArray(data)) {
    return data.map(trimStrings) as T
  }

  if (data !== null && typeof data === 'object') {
    if (data instanceof Date) {
      return data
    }

    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, trimStrings(value)])
    ) as T
  }

  return data
}

export function transformXpandDbWorkOrder(
  dbWorkOrder: XpandDbWorkOrder
): XpandWorkOrder {
  const rowSchema = z.object({
    caption: z.string(),
    locationCaption: z.string().optional(),
    locationCode: z.string().optional(),
    equipmentCaption: z.string().optional(),
    equipmentCode: z.string().optional(),
  })

  try {
    const rows = trimStrings(
      dbWorkOrder.rows
        ? rowSchema.array().parse(JSON.parse(dbWorkOrder.rows))
        : []
    )

    return {
      AccessCaption: dbWorkOrder.masterKey,
      Caption: dbWorkOrder.caption,
      Code: dbWorkOrder.code,
      ContactCode: dbWorkOrder.contactCode,
      Description: rows
        .map((row) =>
          row.locationCaption && row.equipmentCaption
            ? `${row.locationCaption}, ${row.equipmentCaption}: ${row.caption}`
            : row.caption
        )
        .join('\n'),
      Id: dbWorkOrder.code,
      LastChanged: new Date(dbWorkOrder.lastChanged),
      Priority: dbWorkOrder.priority,
      Registered: new Date(dbWorkOrder.createdAt),
      RentalObjectCode: dbWorkOrder.residenceId,
      Status: xpandStatusToString(dbWorkOrder.status),
      WorkOrderRows: rows.map((row) => ({
        Description: row.locationCaption
          ? `${row.locationCaption}: ${row.caption}`
          : row.caption,
        LocationCode: row.locationCode ?? null,
        EquipmentCode: row.equipmentCode ?? null,
      })),
    } satisfies XpandWorkOrder
  } catch (error) {
    throw new Error(`Failed to parse work order rows: ${error}`)
  }
}

function xpandStatusToString(status: number) {
  if (status === 0 || status === 4) {
    return 'Väntar på handläggning'
  }
  if (status === 6) {
    return 'Resurs tilldelad'
  }
  if (status <= 15) {
    return 'Påbörjad'
  }
  if (status === 21) {
    return 'Utförd'
  }
  if (status === 80) {
    return 'Skickad'
  }
  if (status === 100) {
    return 'Väntar på beställda varor'
  }
  if (status > 15) {
    return 'Avslutad'
  }

  throw new Error(`Unknown status: ${status}`)
}
