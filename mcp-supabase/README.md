# Supabase MCP Server

A Model Context Protocol (MCP) server that provides database operations for Supabase.

## Tools Provided

- **supabase_query**: Execute SQL queries on the database
- **supabase_inspect_schema**: Inspect database schema and table structures  
- **supabase_run_migration**: Run SQL migration files
- **supabase_create_table**: Create new tables with specified schema
- **supabase_test_connection**: Test database connection and credentials

## Setup

1. Install dependencies:
```bash
cd mcp-supabase
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Build the server:
```bash
npm run build
```

4. Test the server:
```bash
npm start
```

## Configuration

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "./mcp-supabase"
    }
  }
}
```

## Usage Examples

### Run a Migration
```typescript
await supabase_run_migration({
  migration_sql: `
    CREATE TABLE IF NOT EXISTS help_requests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `
});
```

### Query Database
```typescript
await supabase_query({
  query: "SELECT * FROM user_profiles LIMIT 5"
});
```

### Inspect Schema
```typescript
await supabase_inspect_schema({
  table_name: "subscriptions"  // Optional - omit to list all tables
});
```