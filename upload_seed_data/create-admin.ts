const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const userIdArg = process.argv[2];
  if (!userIdArg) {
    console.error("사용법: npx ts-node create-admin.ts <USER_ID>");
    process.exit(1);
  }

  // 1. Admin Role 생성(또는 upsert)
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" }, // 유니크 값
    update: {}, // 존재하면 아무 것도 업데이트하지 않음
    create: {
      name: "ADMIN",
      description: "Admin role with all permissions",
    },
  });

  const domains = await prisma.domain.findMany({ select: { code: true } });
  const allPermissions = domains.map((domain) => domain.code);
  // 2. "모든 권한"에 해당한다고 가정할 Permission 목록
  //   const allPermissions = domains.map((domain) => domain.code);
  //   const allPermissions = [
  //     "Global",
  //     "ORG_29",
  //     "zzz scorm deletion domain",
  //     "AFRICA",
  //     "CHINA",
  //     "CIS",
  //     "EUROPE",
  //     "OrgCode-7",
  //     "JAPAN",
  //     "ORG_502",
  //     // 필요에 따라 계속 추가...
  //   ];

  // 3. 각 Permission을 upsert하여 생성하고, RolePermission으로 연결
  for (const perName of allPermissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perName },
      update: {},
      create: {
        name: perName,
        description: `Permission for ${perName}`,
      },
    });

    // 도메인에 업데이트
    await prisma.domain.update({
      where: { code: perName },
      data: { permissionId: permission.id },
    });

    // Admin Role과 Permission 연결
    await prisma.rolePermission.upsert({
      where: {
        // 스키마에서 @@unique([roleId, permissionId])가 있어야 사용 가능
        role_permission_unique: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });

    // 각 도메인별 Permission연결
    const roleName = `DOMAIN_${String(perName).toUpperCase()}`;
    const role = await prisma.role.upsert({
      where: { name: roleName }, // 유니크 값
      update: {}, // 존재하면 아무 것도 업데이트하지 않음
      create: {
        name: roleName,
        description: "domain role with its permissions",
      },
    });
    // Admin Role과 Permission 연결
    await prisma.rolePermission.upsert({
      where: {
        // 스키마에서 @@unique([roleId, permissionId])가 있어야 사용 가능
        role_permission_unique: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }

  // 4. 유저(User) 생성 or upsert (email이 유니크하다고 가정)
  const user = { id: userIdArg };

  // 5. User와 Admin Role 연결 (UserRole pivot)
  await prisma.userRole.upsert({
    where: {
      user_role_unique: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Admin user & role setup complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
