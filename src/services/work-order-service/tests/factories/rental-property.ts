import { Factory } from 'fishery'
import { RentalProperty } from '../../schemas'

export const RentalPropertyFactory = Factory.define<RentalProperty>(() => ({
  id: '705-022-04-0201',
  type: 'Apartment',
  property: {
    rentalTypeCode: 'KORTTID',
    rentalType: 'Korttidskontrakt',
    address: 'STENTORPSGATAN 9 A',
    code: '0201',
    number: '1101',
    type: '3 rum och kök',
    entrance: '04',
    floor: '2',
    hasElevator: false,
    washSpace: 'B',
    area: 73,
    estateCode: '02301',
    estate: 'KOLAREN 1',
    buildingCode: '705-022',
    building: 'STENTORPSGATAN 7-9',
  },
  maintenanceUnits: [
    {
      id: '_3CF0USZU9PDOQQ',
      rentalPropertyId: '705-022-04-0201',
      code: '705M03',
      caption: 'Miljöbod Ö48 Stentorpsg. 13',
      type: 'Miljöbod',
      estateCode: '02301',
      estate: 'KOLAREN 1',
    },
    {
      id: '_3CF0UQJ76PDOQQ',
      rentalPropertyId: '705-022-04-0201',
      code: '705M02',
      caption: 'Miljöbod Ö47 Stentorpsg. 7-9',
      type: 'Miljöbod',
      estateCode: '02301',
      estate: 'KOLAREN 1',
    },
    {
      id: '_3SB0PK5VC9K1IT',
      rentalPropertyId: '705-022-04-0201',
      code: '705T15',
      caption: 'TVÄTTSTUGA Stentorpsgatan 7 C',
      type: 'Tvättstuga',
      estateCode: '02301',
      estate: 'KOLAREN 1',
    },
  ],
}))
