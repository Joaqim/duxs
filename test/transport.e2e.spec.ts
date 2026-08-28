import type { AddressInfo } from "node:net";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, expect, it } from "vitest";

import { OngoingWMSClient } from "../dist/esm/index.node.js";

let server: Server;
let baseUrl: string;
const observed: { rawHeaders: string[] }[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    observed.push({ rawHeaders: [...req.rawHeaders] });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end('{"articleSystemId":1}');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise((resolve) => server.close(() => resolve(null))));

it("OngoingWMSClient delivers title-cased ordered headers via the node artifact", async () => {
  const { articlesApiV1 } = new OngoingWMSClient({
    BASE_URL: baseUrl,
    TOKEN: "token",
  });
  const { data, error } = await articlesApiV1.getArticleBySystemId(1);

  expect(error).toBeUndefined();
  expect(data).toEqual({ articleSystemId: 1 });

  /* Wire headers must appear title-cased, in the WHATWG Headers iteration
   * order (lexicographic) — undici's global fetch would send them lowercase. */
  const raw = observed[observed.length - 1].rawHeaders;
  const ours = new Set(["Accept", "Authorization"]);
  const filtered: string[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    if (ours.has(raw[i])) filtered.push(raw[i], raw[i + 1]);
  }
  expect(filtered).toEqual([
    "Accept",
    "application/json",
    "Authorization",
    "Basic token",
  ]);
  expect(raw).not.toContain("authorization");
});
