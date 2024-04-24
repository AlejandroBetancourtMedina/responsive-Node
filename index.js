const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
