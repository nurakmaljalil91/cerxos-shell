export type UsersTableFilters = {
  global: string;
  columns: Record<string, string>;
};

export function buildUsersFilter(filters: UsersTableFilters): string | undefined {
  const global = filters.global?.trim();
  const username = filters.columns['username']?.trim();
  const email = filters.columns['email']?.trim();
  const parts: string[] = [];

  if (global) {
    const value = escapeFilterValue(global);
    parts.push(`username contains '${value}' or email contains '${value}'`);
  }

  if (username) {
    parts.push(`username contains '${escapeFilterValue(username)}'`);
  }

  if (email) {
    parts.push(`email contains '${escapeFilterValue(email)}'`);
  }

  return parts.length ? parts.join(' and ') : undefined;
}

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}
