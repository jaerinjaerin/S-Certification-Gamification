('server-only');

export async function getUserPermissions(userId: string): Promise<string[]> {
  const authorized =
    process.env.NEXT_PUBLIC_ASSETS_DOMAIN +
    '/certification/admin/authorized.json' +
    '?timestamp=' +
    new Date().getTime();

  const response = await fetch(authorized, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data.users) {
      for (const user of data.users) {
        if (user.id === userId) {
          return user.permissions;
        }
      }
    }
  } else {
    console.error(`Failed to fetch permissions: ${response.statusText}`);
  }

  return [];
}
