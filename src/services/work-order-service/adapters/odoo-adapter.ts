import Odoo from 'odoo-await'
import striptags from 'striptags'
import { groupBy } from 'lodash'
import Config from '../../../common/config'
import {
  ApartmentInfo,
  Lease,
  MaintenanceUnitInfo,
  RentalPropertyInfo,
  Tenant,
  CreateWorkOrderDetails,
  CreateWorkOrderMessage,
  OdooWorkOrderMessage,
  CreateWorkOrder,
  OdooWorkOrder,
  CreateWorkOrderRow,
  WorkOrder,
  WorkOrderMessage,
} from 'onecore-types'
import {
  transformWorkOrder,
  transformMessages,
  transformEquipmentCode,
} from './utils'
import {
  AdapterResult,

} from '../types'

const odoo = new Odoo({
  baseUrl: Config.odoo.url,
  db: Config.odoo.database,
  username: Config.odoo.username,
  password: Config.odoo.password,
})

const WORK_ORDER_DOMAIN = (contactCode: string): any[] => [
  ['contact_code', '=', contactCode],
]
const WORK_ORDER_FIELDS: string[] = [
  'id',
  'uuid',
  'contact_code',
  'name',
  'description',
  'priority',
  'pet',
  'call_between',
  'space_code',
  'equipment_code',
  'rental_property_id',
  'create_date',
  'write_date',
  'stage_id',
  'phone_number',
  'maintenance_unit_code',
  'maintenance_unit_caption',
]

const MESSAGE_DOMAIN = (workOrderIds: number[]): any[] => [
  ['res_id', 'in', workOrderIds],
  ['model', '=', 'maintenance.request'],
  [
    'message_type',
    'in',
    [
      'from_tenant',
      'tenant_sms',
      'tenant_mail',
      'tenant_sms_error',
      'tenant_mail_error',
    ],
  ],
]
const MESSAGE_FIELDS: string[] = [
  'id',
  'res_id',
  'body',
  'message_type',
  'author_id',
  'create_date',
]

export const getWorkOrderByContactCode = async (
  contactCode: string
): Promise<any> => {
  try {
    await odoo.connect()

    const odooWorkOrders: OdooWorkOrder[] = await odoo.searchRead(
      'maintenance.request',
      WORK_ORDER_DOMAIN(contactCode),
      WORK_ORDER_FIELDS
    )

    const odooWorkOrderMessages: OdooWorkOrderMessage[] = await odoo.searchRead(
      'mail.message',
      MESSAGE_DOMAIN(odooWorkOrders.map((workOrder) => workOrder.id)),
      MESSAGE_FIELDS
    )

    const messagesById = groupBy(odooWorkOrderMessages, 'res_id')

    const workOrders: WorkOrder[] = odooWorkOrders.map((workOrder) => ({
      ...transformWorkOrder(workOrder),
      Messages: transformMessages(
        messagesById[workOrder.id]
      ) as WorkOrderMessage[],
    }))

    return workOrders
  } catch (error) {
    console.error('Error fetching work orders:', error)
    throw error
  }
}

export const createWorkOrder = async (
  createWorkOrder: CreateWorkOrder
): Promise<AdapterResult<number, unknown>> => {
  try {
    const { rentalPropertyInfo, tenant, lease, details } = createWorkOrder

    if (!rentalPropertyInfo.maintenanceUnits) {
      return { ok: false, err: 'No maintenance unit found' }
    }
    await odoo.connect()
    const maintenanceTeamId = await getMaintenanceTeamId(
      'Vitvarureperatör Mimer'
    )

    // We're currently adding the address of the maintanance unit as the address of the rental property, not sure if this is correct
    const address = rentalPropertyInfo.maintenanceUnits[0].caption.replace(
      'TVÄTTSTUGA ',
      ''
    )
    const newRentalPropertyRecord = await createRentalPropertyRecord(
      rentalPropertyInfo,
      address
    )
    const newLeaseRecord = await createLeaseRecord(lease)
    const newTenantRecord = await createTenantRecord(tenant, details)
    const newMaintenanceUnitRecord = await createMaintenanceUnitRecord(
      rentalPropertyInfo.maintenanceUnits[0],
      details.Rows[0]
    )
    const newWorkOrderId = await createWorkOrderRecord(
      newRentalPropertyRecord,
      newLeaseRecord,
      newTenantRecord,
      newMaintenanceUnitRecord,
      maintenanceTeamId,
      details
    )

    return { ok: true, data: newWorkOrderId }
  } catch (error) {
    console.error('Error creating work order:', error)
    throw error
  }
}

const createRentalPropertyRecord = async (
  rentalPropertyInfo: RentalPropertyInfo,
  address: string
): Promise<number> => {
  try {
    const apartmentProperty = rentalPropertyInfo.property as ApartmentInfo
    return await odoo.create('maintenance.rental.property', {
      name: rentalPropertyInfo.id,
      rental_property_id: rentalPropertyInfo.id,
      property_type: rentalPropertyInfo.type,
      address: address,
      code: apartmentProperty.code,
      area: apartmentProperty.area,
      entrance: apartmentProperty.entrance,
      floor: apartmentProperty.floor,
      has_elevator: apartmentProperty.hasElevator ? 'Ja' : 'Nej',
      wash_space: apartmentProperty.washSpace,
      estate_code: apartmentProperty.estateCode,
      estate: apartmentProperty.estate,
      building_code: apartmentProperty.buildingCode,
      building: apartmentProperty.building,
    })
  } catch (error) {
    console.error('Error creating rental property record:', error)
    throw error
  }
}

const createLeaseRecord = async (lease: Lease): Promise<number> => {
  try {
    return await odoo.create('maintenance.lease', {
      name: lease.leaseId,
      lease_id: lease.leaseId,
      lease_number: lease.leaseNumber,
      lease_type: lease.type,
      lease_start_date: lease.leaseStartDate || false,
      lease_end_date: lease.leaseEndDate || false,
      contract_date: lease.contractDate || false,
      approval_date: lease.approvalDate || false,
    })
  } catch (error) {
    console.error('Error creating lease record:', error)
    throw error
  }
}

const createTenantRecord = async (
  tenant: Tenant,
  details: CreateWorkOrderDetails
): Promise<number> => {
  try {
    const { Email: emailAddress, PhoneNumber: phoneNumber } =
      details.AccessOptions

    return await odoo.create('maintenance.tenant', {
      name: `${tenant.firstName} ${tenant.lastName}`,
      contact_code: tenant.contactCode,
      contact_key: tenant.contactKey,
      national_registration_number: tenant.nationalRegistrationNumber,
      email_address: emailAddress || tenant.emailAddress,
      phone_number:
        phoneNumber ||
        (tenant.phoneNumbers ? tenant.phoneNumbers[0].phoneNumber : ''),
      is_tenant: true,
    })
  } catch (error) {
    console.error('Error creating tenant record:', error)
    throw error
  }
}

const createMaintenanceUnitRecord = async (
  maintenanceUnit: MaintenanceUnitInfo,
  CreateWorkOrderRow: CreateWorkOrderRow
): Promise<number> => {
  try {
    const { MaintenanceUnitCaption: caption, MaintenanceUnitCode: code } =
      CreateWorkOrderRow

    return await odoo.create('maintenance.maintenance.unit', {
      name: caption,
      caption: caption,
      type: maintenanceUnit.type,
      code: code,
      estate_code: maintenanceUnit.estateCode,
    })
  } catch (error) {
    console.error('Error creating maintenance unit record:', error)
    throw error
  }
}

const createWorkOrderRecord = async (
  rentalPropertyRecord: number,
  leaseRecord: number,
  tenantRecord: number,
  maintenanceUnitRecord: number,
  maintenanceTeamId: number,
  details: CreateWorkOrderDetails
): Promise<number> => {
  try {
    return await odoo.create('maintenance.request', {
      rental_property_id: rentalPropertyRecord.toString(),
      lease_id: leaseRecord.toString(),
      tenant_id: tenantRecord.toString(),
      maintenance_unit_id: maintenanceUnitRecord.toString(),
      hearing_impaired: !!details.AccessOptions.Email,
      call_between: details.AccessOptions.CallBetween,
      pet: details.Pet,
      space_code: details.Rows[0].LocationCode,
      equipment_code: details.Rows[0].PartOfBuildingCode,
      description: details.Rows[0].Description,
      images: details.Images,
      name:
        'Felanmäld tvättstuga - ' +
        transformEquipmentCode(details.Rows[0].PartOfBuildingCode),
      master_key: details.AccessOptions.Type === 0,
      space_caption: 'Tvättstuga',
      maintenance_team_id: maintenanceTeamId,
      creation_origin: 'mimer-nu',
    })
  } catch (error) {
    console.error('Error creating work order record:', error)
    throw error
  }
}

const getMaintenanceTeamId = async (teamName: string): Promise<number> => {
  try {
    const team: number[] = await odoo.search('maintenance.team', {
      name: teamName,
    })

    if (team.length === 0) {
      throw new Error(`Maintenance team with name "${teamName}" not found`)
    }

    return team[0]
  } catch (error) {
    console.error('Error getting maintenance team id:', error)
    throw error
  }
}

export const closeWorkOrder = async (workOrderId: number): Promise<boolean> => {
  try {
    await odoo.connect()

    const doneMaintenanceStages = await odoo.searchRead<{
      id: number
    }>(
      'maintenance.stage',
      [
        ['done', '=', true],
        ['name', '=', 'Avslutad'],
      ],
      ['id']
    )

    if (doneMaintenanceStages.length === 0) {
      throw new Error('No done maintenance stages found')
    }

    return await odoo.update('maintenance.request', workOrderId, {
      stage_id: doneMaintenanceStages[0].id,
    })
  } catch (error) {
    console.error('Error closing work order:', error)
    throw error
  }
}

export const addMessageToWorkOrder = async (
  workOrderId: number,
  message: CreateWorkOrderMessage
): Promise<number> => {
  try {
    await odoo.connect()

    return await odoo.execute_kw('maintenance.request', 'message_post', [
      [workOrderId],
      {
        body: striptags(message.body).replaceAll('\n', '<br>'),
        message_type: 'from_tenant',
        body_is_html: true,
      },
    ])
  } catch (error) {
    console.error('Error adding message to work order:', error)
    throw error
  }
}

export const healthCheck = async () => {
  await odoo.connect()
  await odoo.searchRead('maintenance.team')
}
