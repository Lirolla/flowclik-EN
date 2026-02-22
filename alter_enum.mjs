import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(`ALTER TABLE siteConfigs MODIFY COLUMN siteThemeLayout ENUM('classic','sidebar','wedding','wedding-videos','editorial','cinematic') NOT NULL DEFAULT 'classic'`);
  console.log("Schema atualizado com sucesso!");
  await conn.end();
}

run().catch(console.error);
