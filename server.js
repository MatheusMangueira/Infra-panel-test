const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello from InfraPanel. 0.0.2V auto deploy');
});
server.listen(3000, () => console.log('rodando na porta 3000'));
