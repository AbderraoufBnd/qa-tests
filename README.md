# Simple Proxy Service

This is a simple proxy service, which proxies any POST request coming in to downstream server.

Following are the technical requirements:

1. The proxy expects a json request body
2. The json body should always contain a key called "user" else it should throw an error and return 400
3. The proxy expects a json response body from downstream server
4. The response json body from downstream server should always contain a key called "user" else it should throw an error and return 400.
5. The "user" key from the response body will be removed and rest of the body will be returned from proxy server

## Requirements:

1. Python version: 3.12
2. uv installed: https://docs.astral.sh/uv/getting-started/installation/
3. `uv sync`to create and install dependencies
4. Service configuration can be found in `config.py`

### Environment configuration

For a cleaner setup, the tests and helper modules read a few URLs from
environment variables. A `.env.example` file is provided at the project root –
copy it to `.env` and adjust the `PROXY_BASE_URL` / `DOWNSTREAM_BASE_URL`
values if you run the services on non‑standard ports or hosts. The TypeScript
fixtures automatically load these via [`dotenv`](https://www.npmjs.com/package/dotenv).

## Run the service:

```
uv run main.py
```

You should see following:

```
INFO: Started server process [50724]
INFO: Waiting for application startup.
INFO: Application startup complete.
INFO: Uvicorn running on http://localhost:8000 (Press CTRL+C to quit)
```

## Example:

```
POST http://localhost:8000/api/login
Request Body:
{
    "user": 40,
    "password": "12345"
}

Response Body:
{
  "token": "abc123xyz",
  "expires_in": 3600
}
```

## Exercise

1. Please write automation tests for the above requirements. You can use any langugage or framework you are comfortable in.

2. Please also propose how can this service be tested manually.

## Tips:

1. What is a proxy: https://en.wikipedia.org/wiki/Proxy_server
2. You might need to create a downstream service for your testing ( see `config.py`, `PROXY_TARGET_HOST` and `PROXY_TARGET_PORT` to configure proxy to connect to downstream service)

---

## Node.js demonstration (additional)

To illustrate the proxy requirements with a minimal JavaScript stack, a `downStreamServer` folder has been added. It contains:

- `downstream_server.js` – an Express app listening on `localhost:8085` with a `POST /login` route that validates a `user` key and echoes a payload.
- `proxy_server.js` – _(optional)_ an Express-based reverse proxy on `localhost:8000` that implements the same rules. **The tests you run below will use the existing Python proxy in `main.py` instead; this file is provided purely as an alternate JS example.**
- `proxy_client.js` – a simple client that sends a request to the proxy and logs the response. It is already configured to contact `http://localhost:8000`, so running the Python proxy suffices.
- `direct_client.js` – a client that talks directly to the downstream server, bypassing any proxy.
- `package.json` – lists the dependencies and handy npm scripts.

### Automated Playwright tests

A Playwright/TypeScript test suite has been added to verify all of the requirements automatically. The tests live under `qa-tests/tests` and exercise both the Python proxy and the Node downstream server.

The tests are organised professionally:

- `qa-tests/tests/specs/` – contains the `.spec.ts` test files
- `qa-tests/tests/fixtures/` – helper modules and URL constants used by the specs
- configuration files (`playwright.config.ts`, `tsconfig.json`, `package.json`) are at the root of `qa-tests/tests` so they apply to the whole suite.

This mirrors best practice by separating fixtures from the actual test cases.

1. **Install Node dependencies** (from the repository root):

   ```bash
   npm install
   npm run install:playwright    # downloads browser binaries (API tests don't strictly need them but it is safe)
   ```

2. **Start the services** in separate terminals:

   ```bash
   uv run main.py                # start the Python proxy on 8000
   cd downStreamServer && npm run start:downstream
   ```

3. **Run the tests**:

   ```bash
   npm test
   ```

   Playwright will execute a set of API tests that:
   - call the proxy with and without the `user` key,
   - confirm the proxy strips the `user` from downstream responses,
   - exercise the downstream service directly comparing its behaviour.

4. **View the HTML report**:

   ```bash
   npm run test:report
   ```

   A browser window will open with verbose results; the report is also saved in `playwright-report/index.html`.

The helper code and URL constants lives in `qa-tests/tests/helpers/api` for clean reuse and maintenance. The JavaScript client scripts in `downStreamServer` (`proxy_client.js` and `direct_client.js`) now export functions that the Playwright tests even call directly – they can also be used standalone if you prefer to verify behaviour via Node.

Install Node dependencies and run the demo with:

```bash
cd downStreamServer
npm install
# start only the downstream server in a terminal
npm run start:downstream

# ensure the Python proxy (main.py) is running on port 8000
# e.g. from the project root:
#   uv run main.py

# exercise the clients in another terminal -- the proxy client
# will hit the Python proxy, not the Node proxy implementation:
npm run client:proxy
npm run client:direct
```

The behaviour mirrors the Python proxy requirements: request/response JSON must contain `user`, the proxy strips `user` from the downstream response before returning.
