const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Usuario = require('./Usuario');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numeroTicket: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prioridad: {
    type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA'),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'),
    allowNull: false,
    defaultValue: 'ABIERTO'
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tickets',
  timestamps: true
});

Usuario.hasMany(Ticket, { foreignKey: 'creadorId', as: 'ticketsCreados' });
Ticket.belongsTo(Usuario, { foreignKey: 'creadorId', as: 'creador' });

Usuario.hasMany(Ticket, { foreignKey: 'agenteAsignadoId', as: 'ticketsAsignados' });
Ticket.belongsTo(Usuario, { foreignKey: 'agenteAsignadoId', as: 'agenteAsignado' });

module.exports = Ticket;