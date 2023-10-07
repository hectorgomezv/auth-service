import { ROLES } from './roles-config.js';

export default {
  roles: Object.values(ROLES).map((role) => role.name),
  permissions: {
    admin: ['create', 'update', 'delete'],
    user: ['create', 'update', 'delete', 'read'],
    password: ['create', 'update'],
  },
  grants: {
    [ROLES.SUPERADMIN.name]: [
      'admin',
      'create_admin',
      'update_admin',
      'delete_admin',
    ],
    [ROLES.ADMIN.name]: [
      'user',
      'create_user',
      'update_user',
      'delete_user',
      'read_user',
    ],
    [ROLES.USER.name]: ['create_password', 'update_password'],
  },
};
