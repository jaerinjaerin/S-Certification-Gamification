import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const userRoles = await prisma.userRole.findMany({
      include: {
        user: true,
        role: {
          select: {
            name: true,
            permissions: {
              select: { permission: { select: { domains: true } } },
            },
          },
        },
      },
    });

    const result = userRoles.map((userRole) => {
      const { role, user } = userRole;
      const loginName = user?.loginName ? decrypt(user.loginName, true) : '';
      return {
        id: userRole.id,
        userId: user.id,
        loginName,
        roleName: role.name,
        permissions: role.permissions.flatMap((perm) =>
          perm.permission.domains.flatMap((domain) => ({
            id: domain.id,
            name: domain.name,
            permId: domain.permissionId,
          }))
        ),
      };
    });

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const { role, user } = await prisma.userRole.delete({
      where: { id },
      include: {
        user: true,
        role: {
          select: {
            name: true,
            permissions: {
              select: { permission: { select: { domains: true } } },
            },
          },
        },
      },
    });

    // 사용자 권한 삭제시 권한 매핑 데이터도 삭제(삭제하지 않으면 삭제된 사용자가 로그인시 다시 권한을 얻게 됨)
    if (user.loginName) {
      await prisma.userRoleMapping.deleteMany({
        where: { loginName: user.loginName },
      });
    }

    const result = {
      userId: user.id,
      loginName: decrypt(user.loginName || '', true),
      roleName: role.name,
      permissions: role.permissions.flatMap((perm) =>
        perm.permission.domains.flatMap((domain) => ({
          id: domain.id,
          name: domain.name,
          permId: domain.permissionId,
        }))
      ),
    };

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
