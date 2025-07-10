export const canManage = (user) => {
  return user?.rol === 'admin' || user?.rol === 'super_admin';
};

export const canEditHallazgo = (currentUser, hallazgo) => {
  if (!currentUser || !hallazgo) return false;
  
  // Super admin y admin pueden editar todo
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;
  
  if (hallazgo.estado === 'cerrado') return false;
  
  if (currentUser.rol === 'editor') {
    // Verificar si es de su zona (asumiendo que tienen la misma zona)
    return hallazgo.zona === currentUser.zona || !currentUser.zona; 
  }
  
  if (currentUser.puede_editar && hallazgo.usuario_id === currentUser.id) {
    return true;
  }
  
  return false;
};

export const canViewAllHallazgos = (currentUser) => {
  if (!currentUser) return false;

  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;

  if (currentUser.rol === 'editor') return true;

  if (currentUser.rol === 'visualizador') return true;
  
  return false;
};

export const canViewHallazgos = (currentUser, hallazgos) => {
  if (!currentUser) return [];

  // Super admin y admin pueden ver todos los hallazgos
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return hallazgos;

  if (currentUser.rol === 'editor') {
    return hallazgos.filter(h => 
      !currentUser.zona || h.zona === currentUser.zona || h.usuario_id === currentUser.id
    );
  }

  if (currentUser.rol === 'visualizador') {
    return hallazgos.filter(h => 
      !currentUser.zona || h.zona === currentUser.zona
    );
  }

  return hallazgos.filter(h => h.usuario_id === currentUser.id);
};

export const canReopenHallazgo = (currentUser, hallazgo) => {
  if (!currentUser || !hallazgo) return false;
  
  // Solo se puede reabrir si está cerrado
  if (hallazgo.estado !== 'cerrado') return false;

  // Super admin y admin pueden reabrir cualquier hallazgo
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;

  if (currentUser.rol === 'editor') {
    return !currentUser.zona || hallazgo.zona === currentUser.zona || 
           hallazgo.cerrado_por === currentUser.id || hallazgo.usuario_id === currentUser.id;
  }

  return hallazgo.cerrado_por === currentUser.id || hallazgo.usuario_id === currentUser.id;
};

export const canDeleteHallazgo = (currentUser) => {
  if (!currentUser) return false;
  return currentUser.rol === 'admin' || currentUser.rol === 'super_admin';
};

export const canCreateHallazgo = (currentUser) => {
  if (!currentUser) return false;
  return currentUser.rol === 'admin' || 
         currentUser.rol === 'super_admin' ||
         currentUser.rol === 'editor' || 
         currentUser.puede_editar;
};

export const canCloseHallazgo = (currentUser, hallazgo) => {
  if (!currentUser || !hallazgo) return false;
  // No se puede cerrar si ya está cerrado
  if (hallazgo.estado === 'cerrado') return false;
  
  // Super admin y admin pueden cerrar cualquier hallazgo
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;

  if (currentUser.rol === 'editor') {
    return !currentUser.zona || hallazgo.zona === currentUser.zona || hallazgo.usuario_id === currentUser.id;
  }

  return hallazgo.usuario_id === currentUser.id;
};

export const canViewHallazgo = (currentUser, hallazgo) => {
  if (!currentUser || !hallazgo) return false;
  
  // Super admin y admin pueden ver cualquier hallazgo
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') return true;

  if (['editor', 'visualizador'].includes(currentUser.rol)) {
    return !currentUser.zona || hallazgo.zona === currentUser.zona || hallazgo.usuario_id === currentUser.id;
  }
  
  return hallazgo.usuario_id === currentUser.id;
};

export const canManageUsers = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

export const canCreateUser = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

export const canEditUser = (currentUser, targetUser) => {
  if (!currentUser) return false;

  // Super admin puede editar cualquier usuario, incluso otros super_admin
  if (currentUser.rol === 'super_admin') {
    return targetUser.empresa_id === currentUser.empresa_id;
  }

  // Admin puede editar usuarios excepto super_admin
  if (currentUser.rol === 'admin') {
    return targetUser.empresa_id === currentUser.empresa_id && targetUser.rol !== 'super_admin';
  }
  
  return false;
};

export const canManageSuperAdmin = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

export const canDeleteUser = (currentUser, targetUser) => {
  if (!currentUser) return false;
  
  // Nadie puede eliminar super_admin (solo desde base de datos)
  if (targetUser.rol === 'super_admin') return false;

  // Super admin y admin pueden eliminar usuarios (excepto super_admin)
  if (currentUser.rol === 'admin' || currentUser.rol === 'super_admin') {
    return targetUser.id !== currentUser.id && targetUser.empresa_id === currentUser.empresa_id;
  }
  
  return false;
};

export const canManageForms = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

export const canCreateForm = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

export const canDeleteForm = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

// Funciones auxiliares existentes
export const getRoleDisplayName = (rol) => {
  const roles = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    editor: 'Editor',
    usuario: 'Usuario',
    visualizador: 'Visualizador'
  };
  
  return roles[rol] || rol;
};

export const getRoleColor = (rol) => {
  const colors = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    editor: 'bg-blue-100 text-blue-800',
    usuario: 'bg-gray-100 text-gray-800',
    visualizador: 'bg-green-100 text-green-800'
  };
  
  return colors[rol] || 'bg-gray-100 text-gray-800';
};

export const getRolePermissions = (rol) => {
  const permissions = {
    super_admin: [
      'Control total del sistema',
      'Gestionar otros super administradores',
      'Ver todos los hallazgos',
      'Crear hallazgos',
      'Editar cualquier hallazgo',
      'Cerrar cualquier hallazgo',
      'Reabrir cualquier hallazgo',
      'Eliminar hallazgos',
      'Gestionar todos los usuarios',
      'Crear/eliminar formularios',
      'Acceso a configuraciones avanzadas'
    ],
    admin: [
      'Ver todos los hallazgos',
      'Crear hallazgos',
      'Editar cualquier hallazgo',
      'Cerrar cualquier hallazgo',
      'Reabrir cualquier hallazgo',
      'Eliminar hallazgos',
      'Gestionar usuarios (excepto super admin)',
      'Crear/eliminar formularios'
    ],
    editor: [
      'Ver hallazgos de su zona',
      'Crear hallazgos',
      'Editar hallazgos de su zona',
      'Cerrar hallazgos de su zona',
      'Reabrir hallazgos de su zona'
    ],
    visualizador: [
      'Ver hallazgos de su zona',
      'Solo lectura'
    ],
    usuario: [
      'Ver sus hallazgos asignados',
      'Editar sus hallazgos (si tiene permiso)',
      'Cerrar sus hallazgos',
      'Reabrir sus hallazgos'
    ]
  };
  
  return permissions[rol] || [];
};

// Funciones adicionales para verificaciones específicas
export const canManageAllUsers = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

export const canAccessSystemSettings = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

export const canViewSystemLogs = (currentUser) => {
  return currentUser?.rol === 'super_admin' || currentUser?.rol === 'admin';
};

export const canExportData = (currentUser) => {
  return currentUser?.rol === 'super_admin' || currentUser?.rol === 'admin';
};

export const canImportData = (currentUser) => {
  return currentUser?.rol === 'super_admin' || currentUser?.rol === 'admin';
};

export const canManageCompany = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

export const canViewAllStatistics = (currentUser) => {
  return currentUser?.rol === 'super_admin' || currentUser?.rol === 'admin';
};

export const canManageSystemBackup = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

// Función helper para verificar si un usuario es administrador (cualquier tipo)
export const isAdmin = (currentUser) => {
  return currentUser?.rol === 'admin' || currentUser?.rol === 'super_admin';
};

// Función helper para verificar si un usuario es super administrador
export const isSuperAdmin = (currentUser) => {
  return currentUser?.rol === 'super_admin';
};

// Función para obtener el nivel de permisos (número más alto = más permisos)
export const getPermissionLevel = (rol) => {
  const levels = {
    super_admin: 5,
    admin: 4,
    editor: 3,
    visualizador: 2,
    usuario: 1
  };
  
  return levels[rol] || 0;
};

// Función para verificar si un usuario puede realizar acciones sobre otro usuario
export const canActOnUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  const currentLevel = getPermissionLevel(currentUser.rol);
  const targetLevel = getPermissionLevel(targetUser.rol);
  
  // Solo puedes actuar sobre usuarios de menor nivel
  // Excepción: super_admin puede actuar sobre otros super_admin
  if (currentUser.rol === 'super_admin') return true;
  
  return currentLevel > targetLevel;
};