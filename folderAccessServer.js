
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 2424;
const folderToServe = process.argv[2] || './files';

http.createServer((req, res) => {
  let filePath = path.join(folderToServe, req.url);

  // Decode the URL to handle spaces and special characters
  filePath = decodeURIComponent(filePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    if (stats.isDirectory()) {
      fs.readdir(filePath, (err, files) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }

        const fileList = files.map((file) => {
          const encodedPath = encodeURIComponent(path.join(req.url, file));
          return `<a href="${encodedPath}">${file}</a>`;
        }).join('<br>');
        res.setHeader('Content-Type', 'text/html');
        res.end(`<h1>Directory Contents:</h1><br>${fileList}`);
      });
    } else {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }

        res.end(data);
      });
    }
  });
}).listen(port, () => {
  fetch('https://ipecho.net/plain')
    .then(response => response.text())
    .then(externalIP => {
      console.log(`Hosting files at http://${externalIP.trim()}:${port}\nLocal access: http://localhost:${port}`)
    })
    .catch(error => {
      console.log(`File server running at http://localhost:${port}`);
      console.error(`Error getting external IP: ${error.message}`);
    });
});

