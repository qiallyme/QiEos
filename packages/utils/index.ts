import type { Claims } from "@qieos/types";

export const isAdmin = (claims: Claims | null | undefined) =>
  !!claims && claims.role === 'admin';

export const notEmpty = <T>(x: T | null | undefined): x is T => x != null;
