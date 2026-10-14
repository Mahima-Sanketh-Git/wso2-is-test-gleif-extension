# WSO2 IS External Mock Server - GLEIF LEI Verification

A small [Fastify](https://fastify.dev/) service that acts as an **external mock endpoint** for testing the
[WSO2 Identity Server](https://wso2.com/identity-server/) **Action / Extension** flow — specifically a
**GLEIF LEI verification** step during **organization onboarding**.

When a user registers an organization, WSO2 IS calls this server's action endpoint with the user's claims.
The server reads the organization's **LEI** (Legal Entity Identifier) claim, looks it up against the public
[GLEIF API](https://api.gleif.org/), and allows account creation only when the LEI registration status is
`ISSUED`. Otherwise the registration is rejected.

## How it works

1. WSO2 IS invokes `POST /api/v1/lei-verification` with the flow/user claims in the request body.
2. The server extracts the claim `http://wso2.org/claims/lei`.
3. It calls `https://api.gleif.org/api/v1/lei-records/{lei}`.
4. It returns an action response:
   - `SUCCESS` when the LEI record status is `ISSUED`.
   - `FAILED` when the LEI is missing or not valid for account creation.

### Endpoint

`POST /api/v1/lei-verification`

**Request body (from WSO2 IS):**

```json
{
  "event": {
    "flow": {
      "user": {
        "claims": [
          { "uri": "http://wso2.org/claims/lei", "value": "<LEI value>" }
        ]
      }
    }
  }
}
```

**Success response:**

```json
{ "actionStatus": "SUCCESS", "operations": [] }
```

**Failure response:**

```json
{
  "actionStatus": "FAILED",
  "failureReason": "Organization LEI is not valid for account creation.",
  "failureDescription": "Your Organization LEI is not valid for account creation. Please contact your Organization Administrator to update your Organization LEI."
}
```

## Run locally

```bash
npm install
npm start      # runs on http://0.0.0.0:3000
# or, with auto-reload during development:
npm run dev
```

## Deploy on WSO2 Choreo

This repo is meant to be deployed as a **Service** component on
[Choreo](https://wso2.com/choreo/) so it can be exposed as your own public API endpoint that WSO2 IS can call.

1. Fork or use this public repo: `https://github.com/Mahima-Sanketh-Git/wso2-is-test-gleif-extension`
2. In the [Choreo Console](https://console.choreo.dev/), create (or open) a **Project**.
3. Create a **Component → Service**, and choose **Connect a Git repository** as the source.
4. Point it at this repository (add it as an external/public repo), select the branch, and set the build:
   - **Buildpack:** NodeJS
   - **Language version:** Node 18+ (matches `package.json`)
   - The server listens on port `3000`.
5. Choreo detects the service; **build** the component.
6. **Deploy** to an environment. Choreo generates a public **API endpoint** (invoke URL) for the service.
7. Use that endpoint (path `/api/v1/lei-verification`) as the URL when you configure the
   **Action / External Extension** in WSO2 IS.

> For the exact, up-to-date steps to create and configure a service component, follow the official
> Choreo documentation: **[Develop a Service](https://wso2.com/choreo/docs/develop-components/develop-services/develop-a-service/)**.

## Contributing

Contributions are open and welcome! Feel free to open an issue or submit a pull request —
whether it's fixing a bug, improving the docs, or extending the mock verification logic.

## Notes

- `server.crt` / `server.key` are self-signed certs included for local TLS experiments; Choreo terminates TLS for you, so they are not required when deployed there.
- This is a **mock/test** server for validating the WSO2 IS extension flow — not a production service.
