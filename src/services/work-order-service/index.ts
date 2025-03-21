import KoaRouter from '@koa/router'
import { generateRouteMetadata } from 'onecore-utilities'
import * as odooAdapter from './adapters/odoo-adapter'
import { CreateWorkOrder } from 'onecore-types'

/**
 * @swagger
 * tags:
 *   - name: Work Order Service
 *     description: Operations related to work orders
 */
export const routes = (router: KoaRouter) => {
  /**
   * @swagger
   * /(.*)/workOrders/contactCode/{contactCode}:
   *   get:
   *     summary: Get work orders by contact code
   *     tags:
   *       - Work Order Service
   *     description: Retrieves work orders based on the provided contact code.
   *     parameters:
   *       - in: path
   *         name: any
   *         required: true
   *         schema:
   *           type: string
   *         description: Any path segment
   *       - in: path
   *         name: contactCode
   *         required: true
   *         schema:
   *           type: string
   *         description: The contact code to filter work orders.
   *     responses:
   *       '200':
   *         description: Successfully retrieved work orders.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 content:
   *                   type: object
   *                   properties:
   *                     totalCount:
   *                       type: integer
   *                       description: Total number of work orders
   *                     workOrders:
   *                       type: array
   *                       items:
   *                         type: object
   *                         description: Work order details
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '500':
   *         description: Internal server error. Failed to retrieve work orders.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Internal server error
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *     security:
   *       - bearerAuth: []
   */
  router.get('(.*)/workOrders/contactCode/:contactCode', async (ctx: any) => {
    const metadata = generateRouteMetadata(ctx)
    try {
      const workOrders = await odooAdapter.getWorkOrderByContactCode(
        ctx.params.contactCode
      )
      ctx.status = 200
      ctx.body = {
        content: {
          workOrders,
        },
        ...metadata,
      }
    } catch (error: unknown) {
      ctx.status = 500

      if (error instanceof Error) {
        ctx.body = {
          error: error.message,
          ...metadata,
        }
      }
    }
  })

  /**
   * @swagger
   * /(.*)/workOrders:
   *   post:
   *     summary: Create a new work order
   *     tags:
   *       - Work Order Service
   *     description: Creates a new work order based on the provided request body.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               rentalPropertyInfo:
   *                 $ref: '#/components/schemas/RentalPropertyInfo'
   *               tenant:
   *                 $ref: '#/components/schemas/Tenant'
   *               lease:
   *                 $ref: '#/components/schemas/Lease'
   *               details:
   *                 $ref: '#/components/schemas/CreateWorkOrderDetails'
   *     responses:
   *       '200':
   *         description: Work order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 content:
   *                   type: object
   *                   properties:
   *                     newWorkOrderId:
   *                       type: number
   *                       example: 123
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '400':
   *         description: Bad request. Failed to create work order.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Error message from the adapter
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '500':
   *         description: Internal server error. Failed to create work order.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Internal server error
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *     security:
   *       - bearerAuth: []
   */
  router.post('(.*)/workOrders', async (ctx) => {
    const metadata = generateRouteMetadata(ctx)
    try {
      const request = <CreateWorkOrder>ctx.request.body

      const response = await odooAdapter.createWorkOrder(request)
      if (response.ok) {
        ctx.body = {
          content: { newWorkOrderId: response.data },
          ...metadata,
        }
      } else {
        ctx.status = 400
        ctx.body = {
          error: response.err,
          ...metadata,
        }
      }
    } catch (error: unknown) {
      ctx.status = 500

      if (error instanceof Error) {
        ctx.body = {
          error: error.message,
          ...metadata,
        }
      }
    }
  })

  /**
   * @swagger
   * /(.*)/workOrders/{workOrderId}/update:
   *   post:
   *     summary: Add a message to a work order
   *     tags:
   *       - Work Order Service
   *     description: Adds a message to a work order based on the provided work order ID.
   *     parameters:
   *       - in: path
   *         name: workOrderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the work order to which the message will be added.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 description: The message to be added to the work order.
   *                 example: "This is a new message for the work order."
   *     responses:
   *       '200':
   *         description: Message added to the work order successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Message added to work order with ID {workOrderId}
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '400':
   *         description: Bad request. Message is missing from the request body.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 reason:
   *                   type: string
   *                   example: Message is missing from the request body
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '500':
   *         description: Internal server error. Failed to add message to the work order.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: Internal server error
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *     security:
   *       - bearerAuth: []
   */
  router.post('(.*)/workOrders/:workOrderId/update', async (ctx) => {
    const metadata = generateRouteMetadata(ctx)
    const { workOrderId } = ctx.params
    const { message } = ctx.request.body as any

    if (!message) {
      ctx.status = 400
      ctx.body = {
        reason: 'Message is missing from the request body',
        ...metadata,
      }
      return
    }

    try {
      await odooAdapter.addMessageToWorkOrder(parseInt(workOrderId), {
        body: message,
      })

      ctx.status = 200
      ctx.body = {
        message: `Message added to work order with ID ${workOrderId}`,
        ...metadata,
      }
    } catch (error: unknown) {
      ctx.status = 500

      if (error instanceof Error) {
        ctx.body = {
          error: error.message,
          ...metadata,
        }
      }
    }
  })

  /**
   * @swagger
   * /(.*)/workOrders/{workOrderId}/close:
   *   post:
   *     summary: Close a work order
   *     tags:
   *       - Work Order Service
   *     description: Closes a work order based on the provided work order ID.
   *     parameters:
   *       - in: path
   *         name: workOrderId
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the work order to be closed.
   *     responses:
   *       '200':
   *         description: Work order closed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Work order with ID {workOrderId} updated successfully
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *       '500':
   *         description: Internal server error. Failed to close work order.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Failed to update work order with ID {workOrderId}
   *                 metadata:
   *                   type: object
   *                   description: Route metadata
   *     security:
   *       - bearerAuth: []
   */
  router.post('(.*)/workOrders/:workOrderId/close', async (ctx) => {
    const metadata = generateRouteMetadata(ctx)
    try {
      const { workOrderId } = ctx.params

      await odooAdapter.closeWorkOrder(parseInt(workOrderId, 10))

      ctx.status = 200
      ctx.body = {
        message: `Work order with ID ${workOrderId} updated successfully`,
        ...metadata,
      }
    } catch (error: unknown) {
      ctx.status = 500

      if (error instanceof Error) {
        ctx.body = {
          error: error.message,
          ...metadata,
        }
      }
    }
  })
}
