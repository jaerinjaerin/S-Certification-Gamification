import {User} from "@prisma/client";
import {prisma} from "@/model/prisma";

('server-only');

export async function getUserPermissions(user:User): Promise<string[]> {
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
      for (const admin of data.users) {
        console.log(admin);
        if (admin.id === user.id
          || admin.providerUserId === user.providerUserId
          || admin.providerUserId === user.providerPersonId) {
          return admin.permissions;
        }
      }
    }
  } else {
    console.error(`Failed to fetch permissions: ${response.statusText}`);
  }

  return [];
}

export async function getUserFromDB(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user from DB: ${error}`);
    return null;
  }
}
