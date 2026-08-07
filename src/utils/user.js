export const getUserInitial = (user) =>
  (user?.user_metadata?.nomeUser?.[0] || user?.email?.[0] || "?").toUpperCase();
