const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'database', 'seed.sql');

try {
    // Read the file with whatever encoding it is, node usually handles utf-8 with bom or basic encodings.
    // Let's read buffer and convert in case it's utf-16 le
    let buffer = fs.readFileSync(filePath);
    let content = buffer.toString('utf16le');
    
    // Check if it's actually utf16le by seeing if it starts properly or looks like gibberish.
    // If it's utf-8, the characters will be completely garbled or content will be short.
    // A quick heuristic: if there are lots of null bytes, it was utf-16
    if (!content.includes('INSERT INTO')) {
        content = buffer.toString('utf8');
    }

    // 1. Fix the double parenthesis in Article Regions
    content = content.replace(/\(20,\s*1\),\s*\(20,\s*2\),\s*\(20,\s*3\)\);/, '(20, 1), (20, 2), (20, 3);');

    // 2. Fix INTERVAL syntax for PostgreSQL
    // MySQL: NOW() - INTERVAL 22 MINUTE
    // PostgreSQL: NOW() - INTERVAL '22 MINUTE'
    content = content.replace(/INTERVAL\s+(\d+)\s+(MINUTE|HOUR|DAY|WEEK|MONTH|YEAR|SECOND)S?/gi, "INTERVAL '$1 $2'");

    // 3. Fix any backticks around table or column names
    content = content.replace(/`([^`]+)`/g, '"$1"');
    
    // 4. Remove USE Media_matrix_final; just in case it exists.
    content = content.replace(/USE\s+Media_matrix_final;/gi, '-- Note: Connect to your database before running');

    // Write back as UTF-8
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated seed.sql to be PostgreSQL compatible.');
} catch (e) {
    console.error('Error:', e);
}
