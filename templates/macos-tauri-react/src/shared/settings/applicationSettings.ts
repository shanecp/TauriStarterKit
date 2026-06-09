import { readSetting, writeSetting } from "./storage";

export const PAGINATION_SIZE_OPTIONS = [10, 50, 100, 250, 500] as const;
export const DEFAULT_PAGINATION_SIZE = 100;

export type PaginationSize = (typeof PAGINATION_SIZE_OPTIONS)[number];

export function isPaginationSize(value: unknown): value is PaginationSize {
  return (
    typeof value === "number" &&
    PAGINATION_SIZE_OPTIONS.includes(value as PaginationSize)
  );
}

export function getStoredDefaultPaginationSize(): PaginationSize {
  return readSetting(
    "defaultPaginationSize",
    isPaginationSize,
    DEFAULT_PAGINATION_SIZE,
  );
}

export function saveDefaultPaginationSize(size: PaginationSize): PaginationSize {
  return writeSetting("defaultPaginationSize", size);
}
