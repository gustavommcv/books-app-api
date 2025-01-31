import express from 'express';
import authRouter from './authRoutes';

const indexRouter = express.Router();

indexRouter.get('/', (request, response) => {
    response.json({
        message: "Welcome to the To-Do API!",
        endpoints: {
          "Not Implemented": "Not Implemented"
        }
    })
});

indexRouter.use('/auth', authRouter);

export default indexRouter;
