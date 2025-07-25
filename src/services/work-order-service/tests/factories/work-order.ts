import { Factory } from 'fishery'
import { RentalPropertyFactory } from './rental-property'
import { TenantFactory } from './tenant'
import { LeaseFactory } from './lease'
import {
  CreateWorkOrderBody,
  CreateWorkOrderDetails,
  OdooWorkOrder,
  OdooWorkOrderMessage,
  WorkOrder,
} from '../../schemas'

export const WorkOrderFactory = Factory.define<WorkOrder>(({ sequence }) => ({
  AccessCaption: 'Huvudnyckel',
  Caption: `Work Order ${sequence}`,
  Code: `WO-${sequence}`,
  ContactCode: `C-${sequence}`,
  Description: 'This is a work order description.',
  DetailsCaption: 'Details about the work order',
  ExternalResource: false,
  Id: `${sequence}`,
  LastChanged: new Date(),
  Priority: 'High',
  Registered: new Date(),
  DueDate: null,
  RentalObjectCode: `RO-${sequence}`,
  Status: 'Resurs tilldelad',
  UseMasterKey: false,
  WorkOrderRows: [
    {
      Description: 'Row description',
      LocationCode: 'LOC1',
      EquipmentCode: 'EQ1',
    },
  ],
  Messages: [
    {
      id: sequence,
      body: 'Message body',
      author: 'Author Name',
      messageType: 'from_tenant',
      createDate: new Date(),
    },
  ],
  Url: `https://example.com/work-order/${sequence}`,
  HiddenFromMyPages: false,
}))

export const OdooWorkOrderFactory = Factory.define<OdooWorkOrder>(
  ({ sequence }) => ({
    uuid: `2fc2276a-13a5-4472-8a0e-e4b12b18d453${sequence}`,
    id: 4,
    contact_code: '158769',
    phone_number: '070000000',
    description: '<p>Ärendebeskrivning</p>',
    priority: '2',
    pet: 'Nej',
    call_between: '08:00 - 17:00',
    space_code: 'TV',
    equipment_code: 'TT',
    rental_property_id: `987-654-321/${sequence}`,
    create_date: new Date().toDateString(),
    write_date: new Date().toDateString(),
    due_date: new Date().toDateString(),
    stage_id: [1, 'Ny Begäran'],
    hidden_from_my_pages: false,
    name: '',
  })
)

export const OdooWorkOrderMessageFactory = Factory.define<OdooWorkOrderMessage>(
  ({ sequence }) => ({
    id: sequence,
    res_id: 4,
    body: 'Hej, här är ett meddelande från kunden',
    message_type: 'from_tenant',
    author_id: [1, 'Kund'],
    create_date: new Date().toDateString(),
  })
)

export const CreateWorkOrderFactory = Factory.define<CreateWorkOrderBody>(
  () => ({
    rentalProperty: RentalPropertyFactory.build(),
    tenant: TenantFactory.build(),
    lease: LeaseFactory.build(),
    details: CreateWorkOrderDetailsFactory.build(),
  })
)

export const CreateWorkOrderDetailsFactory =
  Factory.define<CreateWorkOrderDetails>(({ sequence }) => ({
    ContactCode: `P${158769 + sequence}`,
    RentalObjectCode: `123-456-789`,
    Images: [],
    AccessOptions: {
      Type: 0,
      Email: 'test@mimer.nu',
      PhoneNumber: '070000000',
      CallBetween: '08:00 - 17:00',
    },
    HearingImpaired: false,
    Pet: 'Nej',
    Rows: [
      {
        LocationCode: 'TV',
        PartOfBuildingCode: 'TM',
        Description: 'Ärendebeskrivning',
        MaintenanceUnitCode: undefined,
        MaintenanceUnitCaption: undefined,
      },
    ],
  }))
