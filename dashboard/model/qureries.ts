import { Role, User } from '@prisma/client';
import { prisma } from '@/model/prisma';

// ('server-only');

export async function getUserPermissions(user: User): Promise<Role | null> {
  // console.log('🚀 ~ getUserPermissions ~ user:', user);
  // const authorized =
  //   process.env.NEXT_PUBLIC_ASSETS_DOMAIN +
  //   '/certification/admin/authorized.json' +
  //   '?timestamp=' +
  //   new Date().getTime();

  // const response = await fetch(authorized, {
  //   method: 'GET',
  //   headers: {
  //     'Cache-Control': 'no-cache',
  //     Pragma: 'no-cache',
  //   },
  // });
  //
  // if(response.ok) {
  // const data = await response.json();
  // if (data.users) {
  //   for (const admin of data.users) {
  //     console.log(admin);
  //     if (
  //       admin.id === user.id ||
  //       admin.providerUserId === user.providerUserId ||
  //       admin.providerUserId === user.providerPersonId
  //     ) {
  //       return admin.permissions;
  //     }
  //   }
  // }
  // } else {
  //   console.error(`Failed to fetch permissions`);
  // }

  try {
    // 사용자 역할 찾기
    const userRole = await prisma.userRole.findFirst({
      where: { userId: user.id },
      include: { role: true },
    });

    if (userRole?.role) {
      // 사용자 권한 확인
      const role = await prisma.role.findUnique({
        where: { id: userRole.roleId },
        include: {
          permissions: {
            select: {
              permission: { select: { name: true, domains: true } },
            },
          },
        },
      });

      if (role) {
        // 권한 반환
        return role;
      }
    } else {
      // 사용자 로그인 이름으로 권한 맵핑테이블에서 매치 되는 것이 있는지 확인
      if (user.loginName) {
        const rollMapping = await prisma.userRoleMapping.findUnique({
          where: { loginName: user.loginName },
        });

        // 있으면 권한 부여
        if (rollMapping) {
          await prisma.userRole.upsert({
            where: {
              user_role_unique: { userId: user.id, roleId: rollMapping.roleId },
            },
            update: {},
            create: { userId: user.id, roleId: rollMapping.roleId },
          });

          const role = await prisma.role.findUnique({
            where: { id: rollMapping.roleId },
            include: {
              permissions: {
                select: {
                  permission: { select: { name: true, domains: true } },
                },
              },
            },
          });

          if (role) {
            // 권한 반환
            return role;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to fetch permissions: ${error}`);
  }

  return null;
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
