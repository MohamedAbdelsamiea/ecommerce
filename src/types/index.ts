export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type SearchParams = Record<string, string | string[] | undefined>;
