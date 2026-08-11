# Set up an MCP client

Requires FieldsRaven 0.30.21 or later

Create a token in authenticated FieldsRaven Settings first. Put the one-time plaintext in the `FIELDSRAVEN_MCP_TOKEN` environment variable. Never paste the token into a configuration file; the examples below contain only an environment-variable reference.

## Set and later remove the environment variable

Set the variable in the environment that launches your client:

```sh
export FIELDSRAVEN_MCP_TOKEN='paste-the-token-here'
```

Restart or reload the client after setting, changing, or revoking a token. When you are finished, remove it from the launching environment and restart or reload again:

```sh
unset FIELDSRAVEN_MCP_TOKEN
```

Do not paste the export command into the client configuration. Keep shell history and screen recordings in mind when setting a real secret.

## Codex CLI

Codex CLI `0.145.0` — clean-profile `config.toml`.

Add this exact server block to the clean profile's `config.toml`:

```toml
[mcp_servers.fieldsraven]
url = "https://fieldsraven.app/mcp"
bearer_token_env_var = "FIELDSRAVEN_MCP_TOKEN"
```

## Claude Code

Claude Code `2.1.220` — clean-profile `.mcp.json`.

Create `.mcp.json` at the root of the clean profile:

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

## Cursor Agent

Cursor Agent `2026.08.04-aaa8809` — clean-profile `mcp.json`.

Create `mcp.json` in the clean Cursor profile:

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

The placeholder syntax differs between Claude Code and Cursor Agent. Preserve it exactly. After reloading, call `get_app_info`, list the available tools, and use [Tools and permissions](tools-reference.md) to confirm that the token has the intended capability.

These versions and file shapes are the tested onboarding contract. Live client connection checks are a separate release gate; configuration alone does not prove connectivity.
