import app from './app';
import { serverConfig } from './config';
import logger from './config/logger.config';
import { sequelize } from './database/models';

app.listen(serverConfig.PORT, async () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`API Documentation available at http://localhost:${serverConfig.PORT}/api-docs`);

    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        logger.info('Database connection established & models synchronized successfully');
    } catch (error: any) {
        logger.error('Error establishing database connection:', error);
    }
});
