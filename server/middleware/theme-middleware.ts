import { enhance, type UniversalMiddleware } from "@universal-middleware/core";

type ColorScheme = "light" | "dark";

const getCookieColorScheme = (cookieHeader: string) => {
  const match = cookieHeader.match(/(?:^|;\s*)theme=(light|dark|auto)/);
  const value = match?.[1];
  // "auto" means the user wants system-detected theme - skip cookie resolution
  if (value === "auto") return null;
  return value === "dark" || value === "light" ? value : null;
};

const getClientHintColorScheme = (headerValue: string | null) => {
  return headerValue === "dark" || headerValue === "light" ? headerValue : null;
};

const getCookieRawPreference = (cookieHeader: string): string | null => {
  const match = cookieHeader.match(/(?:^|;\s*)theme=(light|dark|auto)/);
  return match?.[1] ?? null;
};

const resolveColorScheme = (
  request: Request,
): { colorScheme: ColorScheme; colorSchemePreference: string } => {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawPref = getCookieRawPreference(cookieHeader);
  const cookieColorScheme = getCookieColorScheme(cookieHeader);

  if (cookieColorScheme) {
    return {
      colorScheme: cookieColorScheme,
      colorSchemePreference: rawPref ?? "auto",
    };
  }

  const clientHintColorScheme = getClientHintColorScheme(
    request.headers.get("sec-ch-prefers-color-scheme"),
  );
  if (clientHintColorScheme) {
    return {
      colorScheme: clientHintColorScheme,
      colorSchemePreference: rawPref ?? "auto",
    };
  }

  return { colorScheme: "light", colorSchemePreference: rawPref ?? "auto" };
};

export const themeMiddleware: UniversalMiddleware = enhance(
  async (request, context) => ({
    ...context,
    ...resolveColorScheme(request),
  }),
  {
    name: "my-app:theme-middleware",
    immutable: false,
  },
);
