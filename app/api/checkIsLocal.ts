import "server-only";

export function checkIsLocal() {
  return process.env.IS_LOCAL === "true";
}
