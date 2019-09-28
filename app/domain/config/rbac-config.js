module.exports = {
  roles: ['superAdmin', 'admin', 'user'],
  permissions: {
    admin: ['create', 'update', 'delete'],
    user: ['create', 'update', 'delete'],
    password: ['create', 'update'],
  },
  grants: {
    superAdmin: ['admin', 'create_admin', 'update_admin', 'delete_admin'],
    admin: ['user', 'create_user', 'update_user', 'delete_user'],
    user: ['create_password', 'update_password'],
  },
};
