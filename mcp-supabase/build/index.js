#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env.local') });
class SupabaseMCPServer {
    server;
    supabase;
    constructor() {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials in environment variables');
        }
        this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        this.server = new Server({
            name: 'supabase-mcp-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'supabase_query',
                        description: 'Execute a SQL query on the Supabase database',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The SQL query to execute'
                                },
                                params: {
                                    type: 'array',
                                    description: 'Parameters for the query (optional)',
                                    items: { type: 'string' }
                                }
                            },
                            required: ['query']
                        }
                    },
                    {
                        name: 'supabase_inspect_schema',
                        description: 'Inspect database schema and table structures',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                table_name: {
                                    type: 'string',
                                    description: 'Specific table to inspect (optional - if not provided, lists all tables)'
                                }
                            }
                        }
                    },
                    {
                        name: 'supabase_run_migration',
                        description: 'Run a SQL migration file on the database',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                migration_sql: {
                                    type: 'string',
                                    description: 'The complete SQL migration to execute'
                                }
                            },
                            required: ['migration_sql']
                        }
                    },
                    {
                        name: 'supabase_create_table',
                        description: 'Create a new table with specified schema',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                table_name: {
                                    type: 'string',
                                    description: 'Name of the table to create'
                                },
                                columns: {
                                    type: 'array',
                                    description: 'Column definitions',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            type: { type: 'string' },
                                            constraints: { type: 'string' }
                                        },
                                        required: ['name', 'type']
                                    }
                                }
                            },
                            required: ['table_name', 'columns']
                        }
                    },
                    {
                        name: 'supabase_test_connection',
                        description: 'Test the connection to Supabase and verify credentials',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'supabase_query':
                        return await this.handleQuery(args);
                    case 'supabase_inspect_schema':
                        return await this.handleInspectSchema(args);
                    case 'supabase_run_migration':
                        return await this.handleRunMigration(args);
                    case 'supabase_create_table':
                        return await this.handleCreateTable(args);
                    case 'supabase_test_connection':
                        return await this.handleTestConnection();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error executing ${name}: ${errorMessage}`
                        }
                    ]
                };
            }
        });
    }
    async handleQuery(args) {
        const { query, params = [] } = args;
        console.log(`[MCP] Executing query: ${query.substring(0, 100)}...`);
        try {
            // Try to execute as RPC first
            const { data, error } = await this.supabase.rpc('exec_sql', {
                sql: query
            });
            if (error) {
                throw new Error(`Query failed: ${error.message}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Query executed successfully.\nResult: ${JSON.stringify(data, null, 2)}`
                    }
                ]
            };
        }
        catch (rpcError) {
            // Fallback: try to extract table name and do a simple select
            const tableName = this.extractTableName(query);
            if (tableName && query.toLowerCase().includes('select')) {
                try {
                    const { data, error } = await this.supabase.from(tableName).select('*').limit(5);
                    if (error)
                        throw error;
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Query executed (fallback mode).\nResult: ${JSON.stringify(data, null, 2)}`
                            }
                        ]
                    };
                }
                catch (fallbackError) {
                    throw new Error(`Query failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown error'}`);
                }
            }
            else {
                throw new Error(`Query failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown error'}`);
            }
        }
    }
    async handleInspectSchema(args) {
        const { table_name } = args;
        console.log(`[MCP] Inspecting schema${table_name ? ` for table: ${table_name}` : ''}`);
        if (table_name) {
            // Inspect specific table
            const { data, error } = await this.supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable, column_default')
                .eq('table_name', table_name)
                .eq('table_schema', 'public');
            if (error) {
                throw new Error(`Failed to inspect table ${table_name}: ${error.message}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Schema for table '${table_name}':\n${JSON.stringify(data, null, 2)}`
                    }
                ]
            };
        }
        else {
            // List all tables
            const { data, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name, table_type')
                .eq('table_schema', 'public');
            if (error) {
                throw new Error(`Failed to list tables: ${error.message}`);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Database tables:\n${JSON.stringify(data, null, 2)}`
                    }
                ]
            };
        }
    }
    async handleRunMigration(args) {
        const { migration_sql } = args;
        console.log(`[MCP] Running migration: ${migration_sql.substring(0, 100)}...`);
        // Split migration into individual statements
        const statements = migration_sql
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);
        const results = [];
        for (const statement of statements) {
            if (statement.toLowerCase().includes('select') || statement.toLowerCase().includes('show')) {
                // Handle SELECT queries
                const { data, error } = await this.supabase.rpc('exec_sql', { sql: statement });
                if (error) {
                    results.push(`❌ Error: ${error.message}`);
                }
                else {
                    results.push(`✅ Query executed: ${JSON.stringify(data)}`);
                }
            }
            else {
                // Handle DDL/DML statements
                const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
                if (error) {
                    results.push(`❌ Error executing "${statement.substring(0, 50)}...": ${error.message}`);
                }
                else {
                    results.push(`✅ Successfully executed: ${statement.substring(0, 50)}...`);
                }
            }
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `Migration completed.\nResults:\n${results.join('\n')}`
                }
            ]
        };
    }
    async handleCreateTable(args) {
        const { table_name, columns } = args;
        console.log(`[MCP] Creating table: ${table_name}`);
        const columnDefs = columns.map((col) => `${col.name} ${col.type}${col.constraints ? ` ${col.constraints}` : ''}`).join(',\n  ');
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.${table_name} (
        ${columnDefs}
      );
    `;
        const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
        if (error) {
            throw new Error(`Failed to create table: ${error.message}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `✅ Successfully created table '${table_name}'\nSQL executed:\n${createTableSQL}`
                }
            ]
        };
    }
    async handleTestConnection() {
        console.log('[MCP] Testing Supabase connection...');
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('id')
                .limit(1);
            if (error) {
                throw error;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: '✅ Supabase connection successful!\nCredentials are valid and database is accessible.'
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Supabase connection failed: ${errorMessage}`
                    }
                ]
            };
        }
    }
    extractTableName(query) {
        const match = query.match(/(?:FROM|UPDATE|INSERT\s+INTO)\s+([`"]?)(\w+)\1/i);
        return match ? match[2] : null;
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Supabase MCP server running on stdio');
    }
}
// Start the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map