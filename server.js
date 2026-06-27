require('dotenv').config();
const http = require('http');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS counter (
      id SERIAL PRIMARY KEY,
      value INT NOT NULL DEFAULT 0
    )
  `);
  const { rows } = await pool.query('SELECT * FROM counter WHERE id = 1');
  if (rows.length === 0) {
    await pool.query('INSERT INTO counter (value) VALUES (0)');
  }
}

const html = (count) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>InfraPanel Counter</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f0f0f; color: #f2f2f2; }
    h1 { font-size: 80px; margin: 0; }
    p { color: #666; margin-bottom: 32px; }
    button { padding: 16px 40px; font-size: 20px; background: #F2C94C; color: #1a1200; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; }
    button:hover { background: #f7da78; }
  </style>
</head>
<body>
  <p>contador salvo no banco de dados 0.0.2</p>
  <h1>${count}</h1>
  <br/>
  <form method="POST" action="/increment">
    <button type="submit">+ 1</button>
  </form>
</body>
</html>
`;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/increment') {
    await pool.query('UPDATE counter SET value = value + 1 WHERE id = 1');
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const { rows } = await pool.query('SELECT value FROM counter WHERE id = 1');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html(rows[0].value));
});

init().then(() => {
  server.listen(3000, () => console.log('rodando na porta 3000'));
});
