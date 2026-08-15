import assert from "node:assert/strict"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs"
import os from "node:os"
import path from "node:path"
import test, { afterEach } from "node:test"

const root = path.resolve(import.meta.dirname, "..")
const staleVersionSentence = "Requires FieldsRaven 0.30.23 or later"
const staleConflictVersionSentence = "Requires FieldsRaven 0.30.5 or later."
const endpoint = "https://fieldsraven.app/mcp"
const placeholderAssignment = "FIELDSRAVEN_MCP_TOKEN=fr_mcp_paste-your-token-here"
const posixLoader = "set -a && source .env && set +a"
const powershellLoader = "$line = Get-Content .env | Where-Object { $_ -match '^FIELDSRAVEN_MCP_TOKEN=' } | Select-Object -First 1\n$env:FIELDSRAVEN_MCP_TOKEN = $line.Substring($line.IndexOf('=') + 1)"

const pages = [
  { file: "mcp/overview.md", title: "MCP overview" },
  { file: "mcp/client-setup.md", title: "Client setup" },
  { file: "mcp/tools-reference.md", title: "Tools and permissions" },
  { file: "mcp/workflows.md", title: "Workflows and receipts" },
  { file: "mcp/errors-and-limits.md", title: "Errors, limits, and security" }
]

const tools = [
  "get_app_info",
  "list_resource_types",
  "list_value_types",
  "list_metaobject_definitions",
  "list_ravens",
  "get_raven",
  "preview_raven_configuration",
  "create_raven",
  "update_raven",
  "verify_submission",
  "list_failed_operations"
]

const clients = [
  {
    client: "Codex CLI",
    version: "0.145.0",
    destination: ".codex/config.toml",
    content: `[mcp_servers.fieldsraven]\nurl = "${endpoint}"\nbearer_token_env_var = "FIELDSRAVEN_MCP_TOKEN"\n`
  },
  {
    client: "Claude Code",
    version: "2.1.220",
    destination: ".mcp.json",
    content: `{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer \${FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}\n`
  },
  {
    client: "Cursor Agent",
    version: "2026.08.04-aaa8809",
    destination: ".cursor/mcp.json",
    content: `{
  "mcpServers": {
    "fieldsraven": {
      "type": "http",
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer \${env:FIELDSRAVEN_MCP_TOKEN}"
      }
    }
  }
}\n`
  }
]

const errors = [
  [ "INVALID_INPUT", "Correct the named safe validation fields and retry." ],
  [ "FORBIDDEN_CAPABILITY", "Use a manage token for create_raven or update_raven." ],
  [ "RAVEN_NOT_FOUND", "List Ravens, then retry with a Raven owned by this shop." ],
  [ "SUBMISSION_NOT_FOUND", "Check the receipt, then use list_failed_operations for a retained failed operation." ],
  [ "CONFIGURATION_CONFLICT", "Preview the configuration and resolve the reported safe prerequisite conflicts." ],
  [ "REVISION_CONFLICT", "Read the Raven again, then retry with its current revision." ],
  [ "IDEMPOTENCY_CONFLICT", "Reuse the original request for that idempotency key or choose a new key." ],
  [ "RATE_LIMITED", "Wait for details.retry_after_seconds and any transport Retry-After delay, then retry." ],
  [ "SHOPIFY_SCOPES_NOT_GRANTED", "Grant the reported Shopify scopes, then retry." ],
  [ "UPSTREAM_UNAVAILABLE", "Wait and retry; contact support if the condition persists." ],
  [ "UPSTREAM_TIMEOUT", "Wait and retry; contact support if the condition persists." ],
  [ "PARTIAL", "Inspect remote_effects and local_applied, then reconcile before retrying." ],
  [ "INTERNAL_ERROR", "Retry once; if it persists, contact support with the request ID." ]
]

const temporaryProfiles = new Set()

afterEach(() => {
  for (const profile of temporaryProfiles) rmSync(profile, { recursive: true, force: true })
  temporaryProfiles.clear()
})

function read(relativePath) {
  const absolutePath = path.join(root, relativePath)
  assert.ok(existsSync(absolutePath), `${relativePath} is missing`)
  return readFileSync(absolutePath, "utf8")
}

function count(text, pattern) {
  return [ ...text.matchAll(pattern) ].length
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function fences(text, language) {
  return [ ...text.matchAll(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm) ]
    .filter((match) => match[1].trim() === language)
    .map((match) => match[2])
}

function setupPrompt({ client, destination, content }) {
  return `Set up the FieldsRaven MCP server for this project in ${client}.

1. Confirm that .env is ignored by git. Do not open, read, print, log,
   move, or commit its contents. If the FIELDSRAVEN_MCP_TOKEN environment
   variable is unavailable, ask me to add it to .env manually; never ask
   me to paste the token into chat.
2. Create ${destination} with the exact configuration between the markers
   below. It connects to ${endpoint} and references only the environment-
   variable name FIELDSRAVEN_MCP_TOKEN. Never write the token into the
   configuration file.

BEGIN FIELDSRAVEN MCP CONFIG
${content.trimEnd()}
END FIELDSRAVEN MCP CONFIG

3. Tell me how to load the project .env for my operating system and
   restart ${client} so the new process inherits the variable. Do not load
   or inspect .env yourself.
4. In the fresh client process, confirm that FieldsRaven exposes exactly
   11 tools, then call get_app_info and report the negotiated protocol and
   server version. Stop and explain any missing prerequisite; do not mutate
   store data merely to test connectivity.
`
}

function positiveAgentEnvInstructions(text) {
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => !/^(?:do not|don't|don’t|never)\b/i.test(sentence))
    .filter((sentence) => (
      /\b(?:ask|tell|have|let|instruct)\s+(?:(?:your|an|the)\s+)?(?:ai\s+)?agent\s+(?:to\s+)?(?:open|read|inspect|print|log|move|load|echo|parse)\b[^.!?;\n]{0,80}\.env\b/i.test(sentence)
      || /\b(?:have|let)\s+\.env\s+(?:be\s+)?(?:opened|read|inspected|printed|logged|moved|loaded|echoed|parsed)\s+by\s+(?:(?:your|an|the)\s+)?(?:ai\s+)?agent\b/i.test(sentence)
    ))
}

test("the five shipped MCP pages omit stale release gates and appear once in SUMMARY", () => {
  const summary = read("SUMMARY.md")

  for (const page of pages) {
    const text = read(page.file)
    assert.equal(count(text, new RegExp(escapeRegex(staleVersionSentence), "g")), 0, `${page.file} must not retain the shipped version gate`)
    assert.equal(count(summary, new RegExp(`\\[${escapeRegex(page.title)}\\]\\(${escapeRegex(page.file)}\\)`, "g")), 1, `SUMMARY.md must link ${page.file} exactly once`)
  }
})

test("troubleshooting omits the shipped Raven conflict release gate", () => {
  assert.doesNotMatch(read("troubleshooting.md"), new RegExp(escapeRegex(staleConflictVersionSentence)))
})

test("overview pins the endpoint, safe token lifecycle, eligibility, and product loop", () => {
  const overview = read("mcp/overview.md")

  assert.match(overview, new RegExp(escapeRegex(endpoint)))
  assert.match(overview, /existing installed app|already installed FieldsRaven/i)
  assert.match(overview, /no separate MCP billing lookup|does not perform a separate MCP billing lookup/i)
  assert.match(overview, /manage[^\n.]*change Raven configuration/i)
  assert.match(overview, /karim@fieldsraven\.app/)
  assert.match(overview, /\]\(\.\.\/quick-start\.md\)/)
  assert.match(overview, /theme placement|theme snippet|theme editor/i)
  assert.match(overview, /authenticated FieldsRaven Settings at `\/settings`/)
  assert.match(overview, /numeric `\/shops\/<shop-id>\/settings\/index` path is compatibility-only/i)
})

test("safe token lifecycle pins every one-time and containment boundary", () => {
  const overview = read("mcp/overview.md")

  assert.match(overview, /Create and revoke MCP tokens from authenticated FieldsRaven Settings at `\/settings` within the embedded app\./)
  assert.match(overview, /short-lived, shop-bound, one-time form nonce/)
  assert.match(overview, /one-time reveal and is shown exactly once/)
  assert.match(overview, /stores only its digest and cannot recover it later/)
  assert.match(overview, /save it manually in a project-root `\.env`/i)
  assert.match(overview, /confirm `\.env` is ignored by git/i)
  assert.match(overview, /never commit/i)
  assert.match(overview, /leave it out of client configuration files, URLs, support messages, logs, and screenshots/)
  assert.match(overview, /Revoking a token takes effect on later authenticated requests\./)
  assert.match(overview, /If the creation response is lost[^\n.]*active token row/i)
  assert.match(overview, /Revoke that row and mint a replacement\./)
  assert.match(overview, /cannot recover|cannot be recovered|Do not expect FieldsRaven to recover/i)
})

test("client setup pins project-local storage, exact loaders, and no global shell profile", () => {
  const clientSetup = read("mcp/client-setup.md")

  assert.match(clientSetup, /create a token[^.]*authenticated FieldsRaven Settings at `\/settings`/i)
  assert.match(clientSetup, /project-root `\.env`/i)
  assert.match(clientSetup, /confirm `\.env` is in `\.gitignore` before adding the token/i)
  assert.match(clientSetup, /never commit `\.env`/i)
  assert.match(clientSetup, /storage, not automatic process loading/i)
  assert.equal(fences(clientSetup, "dotenv").length, 1)
  assert.equal(fences(clientSetup, "dotenv")[0], `${placeholderAssignment}\n`)
  assert.equal(fences(clientSetup, "sh").length, 1)
  assert.equal(fences(clientSetup, "sh")[0], `${posixLoader}\n`)
  assert.equal(fences(clientSetup, "powershell").length, 1)
  assert.equal(fences(clientSetup, "powershell")[0], `${powershellLoader}\n`)
  assert.match(clientSetup, /start or restart[^.]*same terminal[^.]*inherits the variable/i)
  assert.match(clientSetup, /Missing `FIELDSRAVEN_MCP_TOKEN`\? Add the line to `\.env` manually\./)
  assert.match(clientSetup, /Do not ask an AI agent to open or inspect `\.env`\./)
  assert.doesNotMatch(clientSetup, /~\/\.zshrc|\.zshrc/)
  assert.doesNotMatch(clientSetup, /export\s+FIELDSRAVEN_MCP_TOKEN=/)
})

test("client examples are byte exact, parseable, environment backed, and ordered", () => {
  const clientSetup = read("mcp/client-setup.md")
  const tomlBlocks = fences(clientSetup, "toml")
  const jsonBlocks = fences(clientSetup, "json")

  assert.equal(tomlBlocks.length, 1, "client setup needs exactly one Codex TOML block")
  assert.equal(jsonBlocks.length, 2, "client setup needs exactly two JSON blocks")

  const codex = tomlBlocks[0]
  const claude = jsonBlocks[0]
  const cursor = jsonBlocks[1]

  assert.equal(codex, clients[0].content)
  assert.equal(codex.endsWith("\n"), true)
  assert.equal(codex.endsWith("\n\n"), false)
  assert.deepEqual(codex.split("\n"), [
    "[mcp_servers.fieldsraven]",
    `url = "${endpoint}"`,
    "bearer_token_env_var = \"FIELDSRAVEN_MCP_TOKEN\"",
    ""
  ])

  const claudeJson = JSON.parse(claude)
  const cursorJson = JSON.parse(cursor)
  assert.deepEqual(Object.keys(claudeJson), [ "mcpServers" ])
  assert.deepEqual(Object.keys(claudeJson.mcpServers), [ "fieldsraven" ])
  assert.deepEqual(Object.keys(claudeJson.mcpServers.fieldsraven), [ "type", "url", "headers" ])
  assert.deepEqual(Object.keys(claudeJson.mcpServers.fieldsraven.headers), [ "Authorization" ])
  assert.deepEqual(claudeJson, {
    mcpServers: {
      fieldsraven: {
        type: "http",
        url: endpoint,
        headers: { Authorization: "Bearer ${FIELDSRAVEN_MCP_TOKEN}" }
      }
    }
  })
  assert.deepEqual(cursorJson, {
    mcpServers: {
      fieldsraven: {
        type: "http",
        url: endpoint,
        headers: { Authorization: "Bearer ${env:FIELDSRAVEN_MCP_TOKEN}" }
      }
    }
  })
  for (const json of [ claude, cursor ]) {
    assert.equal(json.endsWith("\n"), true)
    assert.equal(json.endsWith("\n\n"), false)
  }

  for (const client of clients) {
    assert.match(clientSetup, new RegExp(`${escapeRegex(client.client)}[^\\n]*` + "`" + escapeRegex(client.version) + "`"))
    assert.match(clientSetup, new RegExp("Project destination: `" + escapeRegex(client.destination) + "`"))
  }
  assert.match(clientSetup, /restart/i)
  assert.match(clientSetup, /never paste|do not paste/i)
})

test("client examples materialize in isolated clean profiles at exact filenames", () => {
  const clientSetup = read("mcp/client-setup.md")
  const examples = [
    [ clients[0].destination, fences(clientSetup, "toml")[0] ],
    [ clients[1].destination, fences(clientSetup, "json")[0] ],
    [ clients[2].destination, fences(clientSetup, "json")[1] ]
  ]

  for (const [ relativeDestination, content ] of examples) {
    const profile = mkdtempSync(path.join(os.tmpdir(), "fieldsraven-mcp-profile-"))
    temporaryProfiles.add(profile)

    try {
      assert.deepEqual(readdirSync(profile), [], `${relativeDestination} project must begin clean`)
      const destination = path.join(profile, relativeDestination)
      mkdirSync(path.dirname(destination), { recursive: true })
      writeFileSync(destination, content, { encoding: "utf8", flag: "wx" })
      assert.equal(readFileSync(destination, "utf8"), content)
      assert.equal(existsSync(destination), true)
    } finally {
      rmSync(profile, { recursive: true, force: true })
      temporaryProfiles.delete(profile)
    }
  }
})

test("client-specific setup prompts are exact, self-contained, and connectivity only", () => {
  const clientSetup = read("mcp/client-setup.md")
  const prompts = fences(clientSetup, "text")

  assert.equal(prompts.length, clients.length)
  clients.forEach((client, index) => {
    assert.equal(prompts[index], setupPrompt(client), `${client.client} setup prompt drifted`)
    assert.match(prompts[index], /Confirm that \.env is ignored by git\./)
    assert.match(prompts[index], /Do not open, read, print, log,/)
    assert.match(prompts[index], /ask me to add it to \.env manually/)
    assert.match(prompts[index], /never ask\s+me to paste the token into chat/i)
    assert.match(prompts[index], /Never write the token into the\s+configuration file\./)
    assert.match(prompts[index], /Do not load\s+or inspect \.env yourself\./)
    assert.match(prompts[index], /exactly\s+11 tools/)
    assert.match(prompts[index], /call get_app_info/)
    assert.match(prompts[index], /do not mutate\s+store data merely to test connectivity\./)
    assert.deepEqual(positiveAgentEnvInstructions(prompts[index]), [])
  })

  const unsafeExamples = [
    "Ask your AI agent to read .env.",
    "Tell the agent to inspect .env.",
    "Have .env read by your AI agent.",
    "Do not tell your agent to read .env. Ask your AI agent to print .env."
  ]
  for (const example of unsafeExamples) assert.notDeepEqual(positiveAgentEnvInstructions(example), [])
})

test("MCP pages contain no token plaintext or unsafe agent env instruction", () => {
  for (const page of pages) {
    const text = read(page.file)
    const withoutApprovedPlaceholder = text.replaceAll(placeholderAssignment, "")

    assert.doesNotMatch(withoutApprovedPlaceholder, /fr_mcp_[A-Za-z0-9_-]{16,}/, `${page.file} contains a token-shaped value`)
    assert.deepEqual(positiveAgentEnvInstructions(text), [], `${page.file} tells an agent to inspect .env`)
  }
})

test("tool reference lists exactly eleven tools in canonical order with exact permissions", () => {
  const reference = read("mcp/tools-reference.md")
  const rows = [ ...reference.matchAll(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*(Yes|No)\s*\|\s*(Yes|No)\s*\|/gm) ]
  const listedTools = rows.map((row) => row[1])

  assert.deepEqual(listedTools, tools)
  assert.equal(new Set(listedTools).size, 11)
  for (const row of rows) {
    const tool = row[1]
    const readAllowed = row[2] === "Yes"
    const manageAllowed = row[3] === "Yes"
    assert.equal(readAllowed, ![ "create_raven", "update_raven" ].includes(tool), `${tool} read permission is wrong`)
    assert.equal(manageAllowed, true, `${tool} manage permission is wrong`)
  }
  assert.match(reference, /manage tokens include every read permission/i)
})

test("workflow guidance pins receipts, retention, verification, and safe mutation semantics", () => {
  const workflows = read("mcp/workflows.md")

  assert.match(workflows, /discover[^\n.]*preview[^\n.]*create[^\n.]*update/i)
  assert.match(workflows, /submit[^\n.]*poll[^\n.]*deep[^\n.]*failed operation/i)
  assert.match(workflows, /optimistic revision|optimistic concurrency/i)
  assert.match(workflows, /idempotency key/i)
  assert.match(workflows, /Every successful storefront submission response contains one stateless encrypted receipt for each committed Field\./)
  assert.doesNotMatch(workflows, /Every successful storefront response contains/)
  assert.match(workflows, /`create_metafield` and deprecated `create_update_metafield` each return one receipt\./)
  assert.match(workflows, /`create_multiple_metafields` returns one ordered receipt per committed Field\./)
  assert.match(workflows, /`delete_metafield`[^\n.]*does not return a receipt\./)
  assert.match(workflows, /inside[^\n.]*Field transaction|inside[^\n.]*transaction/i)
  assert.match(workflows, /default[^\n.]*seven days[^\n.]*maximum|default and maximum[^\n.]*seven days/i)
  assert.match(workflows, /issuance fail[^\n.]*rolls back/i)
  assert.match(workflows, /failed batch[^\n.]*no receipts/i)
  assert.match(workflows, /never reissue[^\n.]*successful receipt|successful receipt[^\n.]*never reissued/i)
  assert.match(workflows, /retained[^\n.]*only while[^\n.]*Shop/i)
  assert.match(workflows, /cascade[^\n.]*destroyed|cascade[^\n.]*uninstalled/i)
  assert.match(workflows, /expiry[^\n.]*never promises[^\n.]*Field/i)
  assert.match(workflows, /list_failed_operations[^\n.]*fresh receipt[^\n.]*retained failed[^\n.]*Field/i)
  assert.match(workflows, /malformed[^\n.]*expired[^\n.]*cross-shop[^\n.]*missing-Field[^\n.]*SUBMISSION_NOT_FOUND/i)
  assert.match(workflows, /state[^\n.]*fresh local evidence/i)
  assert.match(workflows, /deep[^\n.]*Shopify[^\n.]*Klaviyo[^\n.]*metaobject[^\n.]*customer-link/i)
  assert.match(workflows, /Airtable[^\n.]*`state_only`/i)
})

test("error reference pins the public allowlist, recovery guidance, and shared quotas", () => {
  const reference = read("mcp/errors-and-limits.md")
  const rows = [ ...reference.matchAll(/^\|\s*\d+\s*\|\s*`([A-Z_]+)`\s*\|\s*([^|]+?)\s*\|\s*$/gm) ]

  assert.deepEqual(rows.map((row) => [ row[1], row[2].trim() ]), errors)
  assert.match(reference, /120 authenticated requests per minute/i)
  assert.match(reference, /20 Raven mutations per minute/i)
  assert.match(reference, /6 deep verifications per minute/i)
  assert.match(reference, /shop-wide[^\n.]*across all tokens|across all tokens[^\n.]*shop-wide/i)
  assert.match(reference, /mutation[^\n.]*general admission/i)
  assert.match(reference, /deep[^\n.]*general admission/i)
  assert.match(reference, /details\.retry_after_seconds/)
  assert.match(reference, /transport `Retry-After`/)
})

test("security guidance keeps customer data private and separates every key boundary", () => {
  const security = read("mcp/errors-and-limits.md")

  assert.match(security, /protected customer data/i)
  assert.match(security, /never[^\n.]*bearer token/i)
  assert.match(security, /never[^\n.]*submitted value/i)
  assert.match(security, /never[^\n.]*raw integration|never[^\n.]*third-party payload/i)
  assert.match(security, /API-token digests[^\n.]*issuance nonces[^\n.]*cursors/i)
  assert.match(security, /separate Rails key-generator purposes/i)
  assert.match(security, /rotate with `SECRET_KEY_BASE`/i)
  assert.match(security, /`FR_RECEIPT_KEY`[^\n.]*`SECRET_KEY_BASE` fallback/i)
  assert.match(security, /`FR_RECEIPT_KEY_ID`/)
  assert.match(security, /`FR_RECEIPT_KEY_PREVIOUS`[^\n.]*`FR_RECEIPT_KEY_PREVIOUS_ID`/i)
  assert.match(security, /one-version[^\n.]*overlap/i)
  assert.match(security, /rotating[^\n.]*root[^\n.]*invalidates[^\n.]*outside[^\n.]*overlap/i)
  assert.match(security, /revoke[^\n.]*mint tokens separately/i)
  assert.match(security, /never expose[^\n.]*key values/i)
})
