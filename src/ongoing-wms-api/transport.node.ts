import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { FetchLike } from "./transport.js";

// WHATWG Headers iteration lowercases names, and the Ongoing WMS endpoint is
// sensitive to header casing; reconstruct conventional title-case before
// handing headers to node:http(s), which sends object keys verbatim.
const titleCase = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

export const transport: FetchLike = async (input, init) => {
  const req = input instanceof Request ? input : new Request(input, init);
  const url = new URL(req.url);
  const headers = Object.fromEntries(
    [...req.headers].map(([name, value]) => [titleCase(name), value]),
  );
  const body = req.body === null ? undefined : await req.text();
  const send = url.protocol === "http:" ? httpRequest : httpsRequest;
  return new Promise<Response>((resolve, reject) => {
    const request = send(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "http:" ? 80 : 443),
        path: url.pathname + url.search,
        method: req.method,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const headers = new Headers();
          for (const [name, value] of Object.entries(res.headers)) {
            if (value === undefined) continue;
            for (const item of Array.isArray(value) ? value : [value]) {
              headers.append(name, item);
            }
          }
          resolve(
            new Response(res.statusCode === 204 ? null : Buffer.concat(chunks), {
              status: res.statusCode,
              headers,
            }),
          );
        });
      },
    );
    request.on("error", reject);
    if (body !== undefined) request.write(body);
    request.end();
  });
};
