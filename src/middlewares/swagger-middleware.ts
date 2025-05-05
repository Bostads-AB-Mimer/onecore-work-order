import KoaRouter from '@koa/router'
import { z } from 'zod'
import swaggerJSDoc from 'swagger-jsdoc'
import zodToJsonSchema from 'zod-to-json-schema'

type Schemas = Record<string, ReturnType<typeof zodToJsonSchema>>

export function swaggerMiddleware({
  routes,
  schemas,
  serviceName,
  version,
}: {
  routes: string[]
  schemas: Record<string, z.ZodType>
  serviceName?: string
  version?: string
}) {
  const router = new KoaRouter()

  router.get('/swagger.json', async (ctx) => {
    ctx.set('Content-Type', 'application/json')

    const swaggerSpec = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: serviceName ?? 'Swagger API',
          version: version ?? '1.0.0',
        },
        components: {
          schemas: Object.entries(schemas).reduce<Schemas>(
            (acc, [name, schema]) => {
              acc[name] = zodToJsonSchema(schema)
              return acc
            },
            {}
          ),
        },
      },
      apis: routes,
    }

    ctx.body = swaggerJSDoc(swaggerSpec)
  })

  return router.routes()
}
