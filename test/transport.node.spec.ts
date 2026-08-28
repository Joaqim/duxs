import type { AddressInfo } from "node:net";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, expect, it } from "vitest";

import { transport } from "../src/ongoing-wms-api/transport.node.js";

let server: Server;
let baseUrl: string;
const observed: { method: string; url: string; rawHeaders: string[] }[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = "";
    observed.push({
      method: req.method,
      url: req.url,
      rawHeaders: [...req.rawHeaders],
    });
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      observed[observed.length - 1].url += body ? ` body=${body}` : "";
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end('{"ok":true}');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise((resolve) => server.close(() => resolve(null))));

it("sends title-cased headers in Headers iteration order on the wire", async () => {
  const request = new Request(`${baseUrl}/api/v1/probe`, {
    method: "GET",
    headers: {
      Authorization: "Basic token",
      Accept: "application/json",
      "User-Agent": "@primepack/duxs",
    },
  });
  const response = await transport(request);
  expect(response.status).toBe(200);

  // WHATWG Headers iterate lexicographically; the transport must put them
  // on the wire in that same order, with conventional casing restored.
  // Independent re-implementation of the expected transform:
  const expected = [...request.headers].flatMap(([name, value]) => [
    name
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("-"),
    value,
  ]);

  const ours = new Set(["Accept", "Authorization", "User-Agent"]);
  const raw = observed[observed.length - 1].rawHeaders;
  const filtered: string[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    if (ours.has(raw[i])) filtered.push(raw[i], raw[i + 1]);
  }
  expect(filtered).toEqual(expected);
  expect(raw).not.toContain("authorization");
  expect(raw).not.toContain("user-agent");
});

it("sends the Request body and round-trips the response", async () => {
  const response = await transport(
    new Request(`${baseUrl}/api/v1/probe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleSystemId: 7 }),
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(observed[observed.length - 1].url).toContain('body={"articleSystemId":7}');
});
