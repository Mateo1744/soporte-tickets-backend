const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.ENUM('ADMINISTRADOR', 'AGENTE_SOPORTE', 'USUARIO', 'SUPERVISOR'),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Rol;