
import http from 'http';
import fs from 'fs';

function get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error("JSON Parse Error:", data);
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    try {
        const userId = fs.readFileSync('userid.txt', 'utf8').trim();
        console.log("Testing with User ID:", userId);
        const all = await get('http://localhost:3001/api/loans/market');
        const filtered = await get(`http://localhost:3001/api/loans/market?userId=${userId}`);
        console.log(`All: ${all.length}, Filtered: ${filtered.length}`);
    } catch (err) {
        console.error(err);
    }
}
main();
