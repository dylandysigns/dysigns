declare module "virtual:content" {
  const entries: Record<string, import("./app/content/loadContent").ContentEntry>;
  export default entries;
}
