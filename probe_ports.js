
import fetch from 'node-fetch';

async function probe(port) {
    try {
        const res = await fetch(`http://localhost:${port}/api/users/health`);
        const text = await res.text();
        console.log(`Port ${port}: ${res.status} - ${text}`);
    } catch (e) {
        console.log(`Port ${port}: Error - ${e.message}`);
    }
}

async function run() {
    await probe(5000);
    await probe(5001);
}

run();
