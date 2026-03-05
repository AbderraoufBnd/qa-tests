import express, { Request, Response } from "express";
import { Server } from "http";
import { ENV } from "./env";

// Mock downstream server used by the proxy service tests.

export type MockHandler = (req: Request, res: Response) => void;

let currentHandler: MockHandler | null = null;

const app = express();
app.use(express.json());

// Catch-all route — behaviour is driven by the handler set via setHandler()
app.all("*", (req: Request, res: Response) => {
  if (currentHandler) {
    currentHandler(req, res);
  } else {
    // Default: echo back the request body with the "user" key included
    res.json({ user: req.body?.user ?? "default-user", echo: true });
  }
});

let server: Server | null = null;

/**
 * Start the mock downstream server on the given port.
 */
export function startMockServer(port: number = ENV.MOCK_PORT): Promise<void> {
  return new Promise((resolve, reject) => {
    server = app.listen(port, ENV.MOCK_HOST, () => {
      console.log(`[mock-server] listening on http://${ENV.MOCK_HOST}:${port}`);
      resolve();
    });
    server.on("error", reject);
  });
}

/**
 * Stop the mock downstream server.
 */
export function stopMockServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close((err) => (err ? reject(err) : resolve()));
    server = null;
  });
}

/**
 * Set a custom request handler for the next test scenario.
 */
export function setHandler(handler: MockHandler | null): void {
  currentHandler = handler;
}
