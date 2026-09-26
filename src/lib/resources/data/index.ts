/**
 * Every listing, grouped by the county it serves.
 *
 * Entries live in one file per county so that adding a state, or reviewing Brevard
 * without reading Volusia, does not mean opening a single 1,500-line array.
 */

import type { Resource } from "../types";
import { BREVARD_RESOURCES } from "./brevard";
import { VOLUSIA_RESOURCES } from "./volusia";
import { ORANGE_RESOURCES } from "./orange";
import { STATEWIDE_RESOURCES } from "./statewide";

export const ALL_RESOURCES: Resource[] = [
  ...BREVARD_RESOURCES,
  ...VOLUSIA_RESOURCES,
  ...ORANGE_RESOURCES,
  ...STATEWIDE_RESOURCES,
];
