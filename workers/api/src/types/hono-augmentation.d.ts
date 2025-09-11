// Hono Context augmentation to allow using custom variables with c.set/c.get
// without having to annotate every middleware file. This is a narrow widening
// to support the 'claims' variable used across routes.
import "hono";

declare module "hono" {
  interface ContextVariableMap {
    claims: any;
  }
}
