import { Factory } from 'fishery'
import { Lease } from '../../schemas'

export const LeaseFactory = Factory.define<Lease>(({ sequence }) => ({
  leaseId: `123-456-789/${sequence}`,
  address: {
    street: 'Gatustigen',
    number: '123',
    city: 'Västerås',
    postalCode: '12345',
  },
  approvalDate: undefined,
  contractDate: undefined,
  lastDebitDate: undefined,
  leaseEndDate: undefined,
  leaseNumber: '123',
  leaseStartDate: new Date().toISOString(),
  noticeDate: undefined,
  noticeGivenBy: 'tenant',
  noticeTimeTenant: '',
  preferredMoveOutDate: undefined,
  rentalProperty: undefined,
  rentalPropertyId: '123-456-789',
  rentInfo: {
    currentRent: {
      currentRent: 123,
      additionalChargeAmount: undefined,
      additionalChargeDescription: undefined,
      rentEndDate: undefined,
      rentStartDate: undefined,
      vat: 0,
    },
    futureRents: undefined,
  },
  tenantContactIds: ['P12345'],
  tenants: undefined,
  terminationDate: undefined,
  type: 'Bostadskontrakt',
}))
