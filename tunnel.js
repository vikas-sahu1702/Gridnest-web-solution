const localtunnel = require('localtunnel');
(async () => {
  try {
    const tunnel = await localtunnel({ port: 5000, subdomain: 'vishalweb' });
    console.log('Tunnel URL: ' + tunnel.url);
    tunnel.on('close', () => process.exit(0));
  } catch (e) {
    console.error('Tunnel error:', e.message);
    process.exit(1);
  }
})();
