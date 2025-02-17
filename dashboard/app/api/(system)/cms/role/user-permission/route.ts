import { prisma } from '@/model/prisma';
import { decrypt, encrypt } from '@/utils/encrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // const { searchParams } = request.nextUrl;

    await prisma.$connect();

    const roleData = await prisma.role.findMany({
      include: {
        permissions: { select: { permission: { select: { domains: true } } } },
      },
    });

    const roles = roleData.flatMap((role) => {
      let domainName = role.permissions.flatMap((permission) =>
        permission.permission.domains.map((domain) => domain.name)
      )[0];

      if (role.name === 'ADMIN') {
        domainName = 'All Permissions';
      }

      return {
        id: role.id,
        name: role.name,
        domainName: domainName,
      };
    });

    const usersMapping = await prisma.userRoleMapping.findMany({
      include: {
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

    const result = usersMapping.map((mapping) => {
      return {
        id: mapping.id,
        loginName: decrypt(mapping.loginName, true),
        roleName: mapping.role.name,
        permissions: mapping.role.permissions.flatMap((perm) =>
          perm.permission.domains.flatMap((domain) => ({
            id: domain.id,
            name: domain.name,
            permId: domain.permissionId,
          }))
        ),
      };
    });

    return NextResponse.json({ result, roles }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { loginName: originLoginName, roleId } = await request.json();
    const loginName = encrypt(originLoginName, true);
    //
    await prisma.$connect();

    const check = await prisma.userRoleMapping.findFirst({
      where: { loginName },
    });

    if (check) {
      return NextResponse.json(
        { message: 'User with the same login name already exists' },
        { status: 400 }
      );
    }
    const mapping = await prisma.userRoleMapping.create({
      data: { loginName, roleId },
      include: {
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

    const result = {
      id: mapping.id,
      loginName: decrypt(mapping.loginName, true),
      roleName: mapping.role.name,
      permissions: mapping.role.permissions.flatMap((perm) =>
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
  } finally {
    prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    await prisma.$connect();

    const mapping = await prisma.userRoleMapping.delete({
      where: { id },
      include: {
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

    const result = {
      loginName: decrypt(mapping.loginName, true),
      roleName: mapping.role.name,
      permissions: mapping.role.permissions.flatMap((perm) =>
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
  } finally {
    prisma.$disconnect();
  }
}
