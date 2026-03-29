import { getGlobalContext } from "vike/server";

export const getDb = async () => {
  const globalContext = await getGlobalContext();
  if (globalContext.isClientSide) throw new Error("MCP server is server-only");
  return globalContext.db;
};

export const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export const notFound = (entity: string) => ({
  content: [{ type: "text" as const, text: `${entity} not found` }],
  isError: true as const,
});

export const invalidParams = (message: string) => ({
  content: [{ type: "text" as const, text: `Invalid parameters: ${message}` }],
  isError: true as const,
});

export const dbError = (error: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: `Database error: ${error instanceof Error ? error.message : String(error)}`,
    },
  ],
  isError: true as const,
});

export const textResource = (uri: string, data: unknown) => ({
  contents: [{ uri, text: JSON.stringify(data), mimeType: "application/json" }],
});
