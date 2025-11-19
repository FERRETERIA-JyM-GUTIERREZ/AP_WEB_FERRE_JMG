import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class PermissionService {
  constructor() {
    this.permissions = null;
    this.userRole = null;
    this.userPermissions = null;
  }

  /**
   * Inicializar el servicio con los datos del usuario
   */
  init(user) {
    if (user) {
      this.userRole = user.rol;
      this.userPermissions = user.permisos || [];
    } else {
      this.userRole = null;
      this.userPermissions = null;
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission) {
    // Admin tiene todos los permisos
    if (this.userRole === 'admin') {
      return true;
    }

    // Si no está autenticado, no tiene permisos
    if (!this.userRole) {
      return false;
    }

    // Verificar en permisos específicos del usuario
    if (this.userPermissions && this.userPermissions.includes(permission)) {
      return true;
    }

    // Verificar permisos por defecto del rol
    return this.hasRolePermission(this.userRole, permission);
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  hasRolePermission(role, permission) {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions.includes(permission);
  }

    /**
     * Obtener permisos por defecto de un rol - SIMPLIFICADO
     */
    getRolePermissions(role) {
        const rolePermissions = {
            admin: [
                // Admin tiene todos los permisos
            ],
            vendedor: [
                // Vendedores pueden hacer todo excepto gestionar usuarios
                'inventario.view',
                'inventario.create',
                'inventario.update',
                'inventario.delete',
                'inventario.stock',
                'ventas.view',
                'ventas.create',
                'ventas.update',
                'ventas.delete',
                'ventas.anular',
                'pedidos.view',
                'pedidos.create',
                'pedidos.update',
                'pedidos.delete',
                'pedidos.estado',
                'categorias.view',
                'categorias.create',
                'categorias.update',
                'categorias.delete',
                'reportes.view',
                'reportes.export',
                'envios.view',
                'envios.update',
            ],
            cliente: [
                // Los clientes no tienen permisos de empleado
            ],
        };

        return rolePermissions[role] || [];
    }

  /**
   * Verificar si el usuario tiene cualquiera de los permisos
   */
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario tiene todos los permisos
   */
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si es administrador
   */
  isAdmin() {
    return this.userRole === 'admin';
  }

  /**
   * Verificar si es empleado (no cliente)
   */
  isEmployee() {
    return this.userRole && !['cliente'].includes(this.userRole);
  }

  /**
   * Verificar si es vendedor o superior
   */
  isVendedorOrHigher() {
    return this.hasAnyPermission(['ventas.view', 'ventas.create']);
  }

  /**
   * Verificar si puede gestionar inventario
   */
  canManageInventory() {
    return this.hasAnyPermission(['inventario.create', 'inventario.update', 'inventario.delete']);
  }

  /**
   * Verificar si puede ver reportes
   */
  canViewReports() {
    return this.hasPermission('reportes.view');
  }

  /**
   * Verificar si puede gestionar usuarios
   */
  canManageUsers() {
    return this.hasAnyPermission(['usuarios.create', 'usuarios.update', 'usuarios.delete']);
  }

  /**
   * Obtener todos los permisos del usuario
   */
  getUserPermissions() {
    if (this.userRole === 'admin') {
      return Object.keys(this.getAllPermissions());
    }

    if (this.userPermissions && this.userPermissions.length > 0) {
      return this.userPermissions;
    }

    return this.getRolePermissions(this.userRole);
  }

  /**
   * Obtener todos los permisos disponibles del sistema
   */
  getAllPermissions() {
    return {
      'inventario.view': 'Ver inventario',
      'inventario.create': 'Crear productos',
      'inventario.update': 'Actualizar productos',
      'inventario.delete': 'Eliminar productos',
      'inventario.stock': 'Gestionar stock',
      'ventas.view': 'Ver ventas',
      'ventas.create': 'Crear ventas',
      'ventas.update': 'Actualizar ventas',
      'ventas.delete': 'Eliminar ventas',
      'ventas.anular': 'Anular ventas',
      'pedidos.view': 'Ver pedidos',
      'pedidos.create': 'Crear pedidos',
      'pedidos.update': 'Actualizar pedidos',
      'pedidos.delete': 'Eliminar pedidos',
      'pedidos.estado': 'Cambiar estado de pedidos',
      'categorias.view': 'Ver categorías',
      'categorias.create': 'Crear categorías',
      'categorias.update': 'Actualizar categorías',
      'categorias.delete': 'Eliminar categorías',
      'reportes.view': 'Ver reportes',
      'reportes.export': 'Exportar reportes',
      'usuarios.view': 'Ver usuarios',
      'usuarios.create': 'Crear usuarios',
      'usuarios.update': 'Actualizar usuarios',
      'usuarios.delete': 'Eliminar usuarios',
      'envios.view': 'Ver envíos',
      'envios.update': 'Actualizar envíos',
    };
  }

  /**
   * Obtener roles disponibles - SIMPLIFICADO
   */
  getAvailableRoles() {
    return {
      admin: 'Administrador',
      vendedor: 'Vendedor',
      cliente: 'Cliente',
    };
  }

  /**
   * Obtener información del rol actual
   */
  getCurrentRoleInfo() {
    const roles = this.getAvailableRoles();
    return {
      role: this.userRole,
      name: roles[this.userRole] || 'Sin rol',
      permissions: this.getUserPermissions(),
    };
  }
}

// Crear instancia singleton
const permissionService = new PermissionService();

export default permissionService;
