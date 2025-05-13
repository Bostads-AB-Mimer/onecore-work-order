import { transformXpandDbWorkOrder } from '../../../adapters/xpand-adapter/utils'
import * as factory from '../../factories'

describe('xpand-adapter utils', () => {
  describe('transformXpandDbWorkOrder', () => {
    const xpandDbWorkOrderMock = factory.xpandDbWorkOrder.build()

    it('should transform an xpand work order correctly', () => {
      console.log(xpandDbWorkOrderMock)
      const result = transformXpandDbWorkOrder(xpandDbWorkOrderMock)

      expect(result).toHaveProperty('AccessCaption')
      expect(result).toHaveProperty('Caption')
      expect(result).toHaveProperty('Code')
      expect(result).toHaveProperty('ContactCode')
      expect(result).toHaveProperty('Description')
      expect(result).toHaveProperty('Id')
      expect(result).toHaveProperty('LastChanged')
      expect(result).toHaveProperty('Priority')
      expect(result).toHaveProperty('Registered')
      expect(result).toHaveProperty('RentalObjectCode')
      expect(result).toHaveProperty('Status')
      expect(result).toHaveProperty('WorkOrderRows')

      expect(result.WorkOrderRows).toBeInstanceOf(Array)
      expect(result.WorkOrderRows[0]).toHaveProperty('Description')
      expect(result.WorkOrderRows[0]).toHaveProperty('LocationCode')
      expect(result.WorkOrderRows[0]).toHaveProperty('EquipmentCode')
    })
  })
})
