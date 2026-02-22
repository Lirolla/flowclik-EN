/**
 * Configuração do banco de dados para Hostinger
 * Este arquivo é usado para conectar ao MySQL sem depender do .env
 */

module.exports = {
  host: '127.0.0.1',
  database: 'u759827701_flowclikbr',
  user: 'u759827701_flowclikbr',
  password: 'Pagotto24',
  port: 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Configurações adicionais para produção
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};
