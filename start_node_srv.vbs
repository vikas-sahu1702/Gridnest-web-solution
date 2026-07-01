CreateObject("WScript.Shell").Run "node -e \"const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\Home.Vishal_Sahu\\Desktop\\Vishal web';
const mime = { '.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.json':'application/json' };
http.createServer((req, res) => {
  let f = req.url === '/' ? 'Final Index.html' : req.url.split('?')[0].substring(1);
  let fp = path.join(dir, f);
  if (f === '') fp = path.join(dir, 'Final Index.html');
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('Not Found'); return; }
  let ext = path.extname(fp);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(fp).pipe(res);
}).listen(5555, '0.0.0.0', () => console.log('Server http://0.0.0.0:5555'));\"", 0, False
