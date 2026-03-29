import { Hono } from "hono";
import { provideTelefuncContext, telefunc } from "telefunc";
import { getGlobalContext } from "vike/server";

const app = new Hono();

app.all("*", async (c) => {
  const globalContext = await getGlobalContext();

  // Never happens
  if (globalContext.isClientSide) return;

  provideTelefuncContext({ db: globalContext.db });
  const httpResponse = await telefunc({ request: c.req.raw });
  return new Response(httpResponse.body, {
    status: httpResponse.statusCode,
    headers: { "content-type": httpResponse.contentType },
  });
});

export default app;
