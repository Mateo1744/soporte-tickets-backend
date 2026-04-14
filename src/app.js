const express = require('express');
const cors = require('cors');

const ticketRoutes = require('./routes/ticketRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de soporte tickets funcionando'
  });
});

app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);

module.exports = app;