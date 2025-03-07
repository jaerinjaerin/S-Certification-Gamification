type UserPermission = {
  id: string;
  loginName: string;
  roleName: string;
  permissions: Permission[];
};

type UserRole = UserPermission & {
  userId: string;
};

type Permission = {
  id: string;
  name: string;
  permId: string;
};
