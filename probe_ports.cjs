
const http = require('http');

function probe(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/users/health`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`Port ${port}: ${res.statusCode} - ${data}`);
                resolve();
            });
        });
        req.on('error', (err) => {
            console.log(`Port ${port}: Error - ${err.message}`);
            resolve();
        });
        req.end();
    });
}

async function run() {
    await probe(5000);
    await probe(5001);
}

run();
