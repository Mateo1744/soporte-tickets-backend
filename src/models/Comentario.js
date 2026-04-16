const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ticket = require('./Ticket');
const Usuario = require('./Usuario');

const Comentario = sequelize.define(
  'Comentario',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('INTERNO', 'EXTERNO'),
      allowNull: false
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'comentarios',
    timestamps: true
  }
);

Ticket.hasMany(Comentario, {
  foreignKey: 'ticketId',
  as: 'comentarios'
});

Comentario.belongsTo(Ticket, {
  foreignKey: 'ticketId',
  as: 'ticket'
});

Usuario.hasMany(Comentario, {
  foreignKey: 'usuarioId',
  as: 'comentarios'
});

Comentario.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

module.exports = Comentario;