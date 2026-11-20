const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    fs.writeFileSync('tunnel-url.txt', 'CONNECTING...');
    const tunnel = await localtunnel({ port: 5173 });
    const output = `URL: ${tunnel.url}\nHOST: ${tunnel.url.replace('https://', '')}\n`;
    fs.writeFileSync('tunnel-url.txt', output);
    console.log(output);

    tunnel.on('close', () => {
      fs.writeFileSync('tunnel-url.txt', 'CLOSED');
    });

    tunnel.on('error', (err) => {
      fs.writeFileSync('tunnel-url.txt', 'ERROR: ' + err.message);
    });
  } catch (err) {
    fs.writeFileSync('tunnel-url.txt', 'EXCEPTION: ' + err.message);
  }
})();
