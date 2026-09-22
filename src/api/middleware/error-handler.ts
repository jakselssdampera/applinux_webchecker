import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Global error handler plugin for Fastify.
 * Returns structured JSON error responses.
 */
export async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler(
    (error: Error & { statusCode?: number; validation?: unknown }, _request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode ?? 500;

      // Validation errors
      if (error.validation) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: error.message,
          statusCode: 400,
        });
      }

      // Log server errors
      if (statusCode >= 500) {
        fastify.log.error(error);
      }

      return reply.status(statusCode).send({
        error: statusCode >= 500 ? 'Internal Server Error' : error.message,
        message: error.message,
        statusCode,
      });
    }
  );

  // 404 handler
  fastify.setNotFoundHandler((_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'The requested resource was not found',
      statusCode: 404,
    });
  });
}
