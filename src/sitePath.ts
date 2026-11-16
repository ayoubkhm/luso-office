// Vite replaces BASE_URL in both client and server builds.
export const siteBase = import.meta.env.BASE_URL;
export const sitePath = (path: string) => siteBase + path.replace(/^\//, "");
export function localPath(path: string): string {
  if (siteBase !== "/" && path === siteBase.slice(0, -1)) return "/";
  return siteBase !== "/" && path.startsWith(siteBase)
    ? "/" + path.slice(siteBase.length)
    : path;
}
