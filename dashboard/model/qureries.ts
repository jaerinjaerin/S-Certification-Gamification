('server-only');

export async function getUserPermissions(userId: string): Promise<string[]> {
  const permissions = [];

  const authorized =
    process.env.NEXT_PUBLIC_ASSETS_DOMAIN +
    '/certification/admin/authorized.json';

  console.log(authorized);

  const response = await fetch(authorized, {
    method: 'GET',
  });

  if (response.ok) {
    const data = await response.json();
    if (data.users && data.users.includes(userId)) {
      permissions.push('Global');
    }
  } else {
    console.error(`Failed to fetch permissions: ${response.statusText}`);
  }

  return permissions;
}
