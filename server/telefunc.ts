import { Hono } from "hono";
import { provideTelefuncContext, telefunc } from "telefunc";

import { dbSqlite } from "@/database/drizzle/db";

const app = new Hono();

app.all("*", async (c) => {
  const db = dbSqlite();
  provideTelefuncContext({ db });
  const httpResponse = await telefunc({ request: c.req.raw });
  return new Response(httpResponse.body, {
    status: httpResponse.statusCode,
    headers: { "content-type": httpResponse.contentType },
  });
});

export default app;
