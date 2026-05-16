const { spawn } = require('child_process');
const fs = require('fs');

const mcpCommand = 'npx';
const mcpArgs = [
    '-y',
    'supergateway',
    '--streamableHttp',
    'https://painel-n8n.moovelabs.com/mcp-server/http',
    '--header',
    'authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjYxMTAyZS1iNGQ2LTQwZWItYmY3ZC05YmFkZDQyN2JjOTAiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImJlMGUwZWE2LWI1NTQtNGUwNi1iMDNiLTcyYmEyZGI2MTg3NyIsImlhdCI6MTc2OTUwMDEzNn0.APNL4H9ilDGfjRV_VeLk1LzM793vNX_i46f65KBwkRs'
];

console.log('Starting supergateway...');
const child = spawn(mcpCommand, mcpArgs);

child.stderr.on('data', (data) => console.error(`stderr: ${data}`));

let buffer = '';

child.stdout.on('data', (data) => {
    const str = data.toString();
    buffer += str;
    // Look for our specific ID 3 response
    if (str.includes('"id":3') && str.includes('"result"')) {
        console.log('Found response for ID 3!');
    }
});

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});

// Send requests
const requests = [
    JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": { "name": "script", "version": "1" } } }),
    JSON.stringify({ "jsonrpc": "2.0", "id": 2, "method": "notifications/initialized" }),
    JSON.stringify({ "jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": { "name": "get_workflow_details", "arguments": { "workflowId": "hJg63HsUuvWQ761r" } } })
];

// Give it a moment to startup before sending
setTimeout(() => {
    console.log('Sending requests...');
    child.stdin.write(requests.join('\n') + '\n');
}, 3000);

// Wait a bit then write file and exit
setTimeout(() => {
    console.log('Writing output to workflow_dump.txt');
    fs.writeFileSync('workflow_dump.txt', buffer);
    child.kill();
    process.exit(0);
}, 25000);
