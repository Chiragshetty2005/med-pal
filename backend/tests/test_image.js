const fs = require('fs');
const http = require('http');

const imgPath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\med_pal\\test_xray.png';
const resultPath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\med_pal\\test_result.txt';

const imageData = fs.readFileSync(imgPath);
const boundary = '----FormBoundary' + Math.random().toString(36).substr(2);

const bodyStart = Buffer.from(
  `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test_xray.png"\r\nContent-Type: image/png\r\n\r\n`
);
const bodyEnd = Buffer.from(
  `\r\n--${boundary}\r\nContent-Disposition: form-data; name="scanType"\r\n\r\nxray\r\n--${boundary}--\r\n`
);
const fullBody = Buffer.concat([bodyStart, imageData, bodyEnd]);

const req = http.request({
  hostname: 'localhost', port: 5000, path: '/api/analyze-image', method: 'POST',
  headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': fullBody.length }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync(resultPath, `Status: ${res.statusCode}\n\n${JSON.stringify(JSON.parse(data), null, 2)}`);
    console.log('Done! Status:', res.statusCode);
  });
});

req.on('error', (e) => {
  fs.writeFileSync(resultPath, 'ERROR: ' + e.message);
  console.log('Error:', e.message);
});

req.write(fullBody);
req.end();
