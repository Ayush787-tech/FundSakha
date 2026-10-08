import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import v1Router from './routers/v1/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';

const app = express();

app.use(express.json());
app.use(attachCorrelationIdMiddleware);

// Swagger API Documentation Setup
const swaggerDocumentPath = path.join(__dirname, './docs/swagger.yaml');
try {
    const swaggerDocument = YAML.load(swaggerDocumentPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
    console.error('Failed to load Swagger documentation file:', error);
}

// API Routes
app.use('/api/v1', v1Router);

// Error Handling Middlewares
app.use(appErrorHandler);
app.use(genericErrorHandler);

export default app;
