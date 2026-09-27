/**
 * Public surface of the resource module.
 *
 * Callers import from "@/lib/resources" and get everything, so moving code between
 * these files never touches a call site.
 */

export * from "./types";
export * from "./data";
export * from "./data/towns";
export * from "./logic";
export * from "./links";
