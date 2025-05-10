#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';
import { getRelevantDocs } from './get-relevant-docs.js';
import { homedir } from 'os';
import { getCombinedDocumentation } from './get-combined-documentation.js';

// From https://github.com/modelcontextprotocol/servers/blob/main/src/filesystem/index.ts
// Command line argument parsing
const commandLineArgs = process.argv.slice(2);
if (commandLineArgs.length === 0) {
  console.error('Usage: angular-copilot-prompt-mcp-server <allowed-directory> [additional-directories...]');
  process.exit(1);
}

const expandHome = (filepath: string): string => {
  if (filepath.startsWith('~/') || filepath === '~') {
    return join(homedir(), filepath.slice(1));
  }
  return filepath;
};

const expandedPathsToSearch = commandLineArgs.map((arg) => expandHome(arg));

expandedPathsToSearch.forEach((path) => {
  if (!existsSync(path)) {
    console.error(`Error: Directory ${path} does not exist.`);
    process.exit(1);
  }
});

const server = new Server(
  {
    name: 'angular-copilot-prompt-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema definitions
const RetrieveDocumentationContextArgsSchema = z.object({
  prompt: z.string(),
});
const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'retrieve_documentation_context',
        description:
          'Retrieves relevant context from the documentation files in the local repository.' +
          'if a prompt requests information on something unknown that seems code related, ' +
          'use this tool to retrieve the required context. Pass in the users prompt as an argument.',
        inputSchema: zodToJsonSchema(RetrieveDocumentationContextArgsSchema) as ToolInput,
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    switch (name) {
      case 'retrieve_documentation_context': {
        const parsed = RetrieveDocumentationContextArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for retrieve_documentation_context: ${parsed.error}`);
        }
        const documentation = getCombinedDocumentation(expandedPathsToSearch);
        return {
          content: [{ type: 'text', text: getRelevantDocs(parsed.data.prompt, documentation).join('\n\n') }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
