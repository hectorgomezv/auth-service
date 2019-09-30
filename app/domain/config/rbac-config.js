const { ROLES } = require('./roles-config');

module.exports = {
  roles: Object.values(ROLES),
  permissions: {
    admin: ['create', 'update', 'delete'],
    user: ['create', 'update', 'delete'],
    password: ['create', 'update'],
  },
  grants: {
    [ROLES.SUPERADMIN]: ['admin', 'create_admin', 'update_admin', 'delete_admin'],
    [ROLES.ADMIN]: ['user', 'create_user', 'update_user', 'delete_user'],
    [ROLES.USER]: ['create_password', 'update_password'],
  },
};
