# Angular copilot prompt MCP Server

Node.js server implementing Model Context Protocol (MCP) for retrieving context to improve Angular related copilot prompts.

## Features

- Retrieve context from local documentation files

## API

### Resources

- `file://system`: File system operations interface

### Tools

- **retrieve_documentation_context**

  - Searches through markdown files in the current repository
  - Input: `prompt` (string)
  - Returns markdown file content that highly matches the content in the search prompt

## Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

Note: you can provide sandboxed directories to the server by mounting them to `/projects`. Adding the `ro` flag will make the directory readonly by the server.

### Docker

Note: all directories must be mounted to `/projects` by default.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount",
        "type=bind,src=/Users/username/Desktop,dst=/projects/Desktop",
        "--mount",
        "type=bind,src=/path/to/other/allowed/dir,dst=/projects/other/allowed/dir,ro",
        "--mount",
        "type=bind,src=/path/to/file.txt,dst=/projects/path/to/file.txt",
        "mcp/angularcopilotprompt",
        "/projects"
      ]
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@srleecode/angular-copilot-prompt-mcp-server", "{workspace directory}"]
    }
  }
}
```

## Usage with VS Code

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open Settings (JSON)`.

Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.

> Note that the `mcp` key is not needed in the `.vscode/mcp.json` file.

You can provide sandboxed directories to the server by mounting them to `/projects`. Adding the `ro` flag will make the directory readonly by the server.

### Docker

Note: all directories must be mounted to `/projects` by default.

```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "--mount",
          "type=bind,src=${workspaceFolder},dst=/projects/workspace",
          "mcp/angularcopilotprompt",
          "/projects"
        ]
      }
    }
  }
}
```

### NPX

```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@srleecode/angular-copilot-prompt-mcp-server", "{workspace directory}"]
      }
    }
  }
}
```

## Searching multiple repositories

The "{workspace directory}" is the path that will be searched for documentation and where the cache will be created. Other directory can also be provided

## Build

Docker build:

```bash
docker build -t mcp/angularcopilotprompt -f src/filesystem/Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Publish

To publish run the below

`npm run build && npm publish --access=public`
