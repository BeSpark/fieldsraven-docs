# Set up an MCP client

Follow these three steps for Codex CLI, Claude Code, or Cursor Agent. The token stays in your project's local environment; client configuration and AI chat contain only the environment-variable name.

## 1. Create an access token

First, create a token in authenticated FieldsRaven Settings at `/settings` within the embedded app. The numeric `/shops/<shop-id>/settings/index` path is compatibility-only; use the shopless path for bookmarks and instructions.

Choose **Read** for inspection and verification, or **Manage** only when the client must create or update Ravens. The plaintext is revealed once. If it is lost, revoke the active token row and create a replacement.

## 2. Save the token in this project

Add the token manually to a project-root `.env` using this shape:

```dotenv
FIELDSRAVEN_MCP_TOKEN=fr_mcp_paste-your-token-here
```

Confirm `.env` is in `.gitignore` before adding the token. Never commit `.env`, and never paste the token into an MCP configuration or AI chat. The `.env` file is storage, not automatic process loading.

### macOS or Linux

From the project root, load the variables into the current terminal:

```sh
set -a && source .env && set +a
```

Start or restart your AI client from this same terminal so it inherits the variable. Missing `FIELDSRAVEN_MCP_TOKEN`? Add the line to `.env` manually. Do not ask an AI agent to open or inspect `.env`.

### Windows PowerShell

From the project root, load only the named value into the current PowerShell process:

```powershell
$line = Get-Content .env | Where-Object { $_ -match '^FIELDSRAVEN_MCP_TOKEN=' } | Select-Object -First 1
$env:FIELDSRAVEN_MCP_TOKEN = $line.Substring($line.IndexOf('=') + 1)
```

Start or restart your AI client from this same terminal so it inherits the variable. Missing `FIELDSRAVEN_MCP_TOKEN`? Add the line to `.env` manually. Do not ask an AI agent to open or inspect `.env`.

## 3. Connect your AI agent

Use the exact project destination and configuration for your client. You can also copy the matching prompt into a new agent session; it contains the complete configuration but never the bearer token.

### Codex CLI

Codex CLI `0.145.0`

Project destination: `.codex/config.toml`

```toml
[mcp_servers.fieldsraven]
url = "https://fieldsraven.app/mcp"
bearer_token_env_var = "FIELDSRAVEN_MCP_TOKEN"
```

Tell Codex CLI:

```text
Set up the FieldsRaven MCP server for this project in Codex CLI.

1. Confirm that .env is ignored by git. Do not open, read, print, log,
   move, or commit its contents. If the FIELDSRAVEN_MCP_TOKEN environment
   variable is unavailable, ask me to add it to .env manually; never ask
   me to paste the token into chat.
2. Create .codex/config.toml with the exact configuration between the markers
   below. It connects to https://fieldsraven.app/mcp and references only the environment-
   variable name FIELDSRAVEN_MCP_TOKEN. Never write the token into the
   configuration file.

BEGIN FIELDSRAVEN MCP CONFIG
[mcp_servers.fieldsraven]
url = "https://fieldsraven.app/mcp"
bearer_token_env_var = "FIELDSRAVEN_MCP_TOKEN"
END FIELDSRAVEN MCP CONFIG

3. Tell me how to load the project .env for my operating system and
   restart Codex CLI so the new process inherits the variable. Do not load
   or inspect .env yourself.
4. In the fresh client process, confirm that FieldsRaven exposes exactly
   11 tools, then call get_app_info and report the negotiated protocol and
   server version. Stop and explain any missing prerequisite; do not mutate
   store data merely to test connectivity.
```

### Claude Code

Claude Code `2.1.220`

Project destination: `.mcp.json`

```json
{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "https://fieldsraven.app/mcp",
      "headers": {
        "Authorization": "Bearer ${FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}
```

Tell Claude Code:

```text
Set up the FieldsRaven MCP server for this project in Claude Code.

1. Confirm that .env is ignored by git. Do not open, read, print, log,
   move, or commit its contents. If the FIELDSRAVEN_MCP_TOKEN environment
   variable is unavailable, ask me to add it to .env manually; never ask
   me to paste the token into chat.
2. Create .mcp.json with the exact configuration between the markers
   below. It connects to https://fieldsraven.app/mcp and references only the environment-
   variable name FIELDSRAVEN_MCP_TOKEN. Never write the token into the
   configuration file.

BEGIN FIELDSRAVEN MCP CONFIG
{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "https://fieldsraven.app/mcp",
      "headers": {
        "Authorization": "Bearer ${FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}
END FIELDSRAVEN MCP CONFIG

3. Tell me how to load the project .env for my operating system and
   restart Claude Code so the new process inherits the variable. Do not load
   or inspect .env yourself.
4. In the fresh client process, confirm that FieldsRaven exposes exactly
   11 tools, then call get_app_info and report the negotiated protocol and
   server version. Stop and explain any missing prerequisite; do not mutate
   store data merely to test connectivity.
```

### Cursor Agent

Cursor Agent `2026.08.04-aaa8809`

Project destination: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "https://fieldsraven.app/mcp",
      "headers": {
        "Authorization": "Bearer ${env:FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}
```

Tell Cursor Agent:

```text
Set up the FieldsRaven MCP server for this project in Cursor Agent.

1. Confirm that .env is ignored by git. Do not open, read, print, log,
   move, or commit its contents. If the FIELDSRAVEN_MCP_TOKEN environment
   variable is unavailable, ask me to add it to .env manually; never ask
   me to paste the token into chat.
2. Create .cursor/mcp.json with the exact configuration between the markers
   below. It connects to https://fieldsraven.app/mcp and references only the environment-
   variable name FIELDSRAVEN_MCP_TOKEN. Never write the token into the
   configuration file.

BEGIN FIELDSRAVEN MCP CONFIG
{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "https://fieldsraven.app/mcp",
      "headers": {
        "Authorization": "Bearer ${env:FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}
END FIELDSRAVEN MCP CONFIG

3. Tell me how to load the project .env for my operating system and
   restart Cursor Agent so the new process inherits the variable. Do not load
   or inspect .env yourself.
4. In the fresh client process, confirm that FieldsRaven exposes exactly
   11 tools, then call get_app_info and report the negotiated protocol and
   server version. Stop and explain any missing prerequisite; do not mutate
   store data merely to test connectivity.
```

The placeholder syntax differs between Claude Code and Cursor Agent. Preserve it exactly. In the fresh client process, confirm that FieldsRaven exposes exactly 11 tools, then call `get_app_info`. Report the negotiated protocol and server version; do not create, update, or otherwise mutate store data merely to test connectivity.

These versions, destinations, and file shapes are the tested onboarding contract. Live client connection checks are a separate release gate; configuration alone does not prove connectivity.
