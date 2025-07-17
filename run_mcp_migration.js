#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the migration SQL
const migrationSQL = readFileSync(join(__dirname, 'complete_database_fix.sql'), 'utf8');

// Create MCP request for supabase_run_migration
const mcpRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'supabase_run_migration',
    arguments: {
      migration_sql: migrationSQL
    }
  }
};

console.log('🚀 Running database migration via MCP server...');
console.log('📄 Migration SQL length:', migrationSQL.length, 'characters');

// Spawn the MCP server process
const mcpServer = spawn('node', ['mcp-supabase/build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let output = '';
let errorOutput = '';

mcpServer.stdout.on('data', (data) => {
  output += data.toString();
});

mcpServer.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

mcpServer.on('close', (code) => {
  console.log('\n=== MCP Server Output ===');
  if (output) {
    console.log('stdout:', output);
  }
  if (errorOutput) {
    console.log('stderr:', errorOutput);
  }
  console.log('Process exited with code:', code);
});

// Send the MCP request
mcpServer.stdin.write(JSON.stringify(mcpRequest) + '\n');

// Wait a bit then close
setTimeout(() => {
  mcpServer.stdin.end();
}, 5000);