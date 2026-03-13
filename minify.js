const fs = require('fs');
// 1. Read your local file
const rawData = fs.readFileSync('./gcp-service-account.json', 'utf8');
// 2. Parse it to ensure it's valid
const parsedData = JSON.parse(rawData);
// 3. Stringify it into a single, perfectly escaped line
const minifiedString = JSON.stringify(parsedData);

console.log("\n=== COPY EVERYTHING BELOW THIS LINE ===\n");
console.log(minifiedString);
console.log("\n=== COPY EVERYTHING ABOVE THIS LINE ===\n");