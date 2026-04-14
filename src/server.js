require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL exitosa');

    await sequelize.sync();
    console.log('Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
  }
}

startServer();