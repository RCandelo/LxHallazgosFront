// utils/constants.js

export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'usuario'
};

export const HALLAZGO_ESTADOS = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado'
};

export const FORM_FIELDS = {
  hallazgo: [
    { label: "Proyecto", name: "proyecto", type: "text", required: true },
    { label: "Evaluador", name: "evaluador", type: "text", required: true },
    { label: "Zona", name: "zona", type: "text", required: true },
    { label: "Departamento", name: "departamento", type: "text", required: true },
    { label: "Actividad a Realizar", name: "actividad_realizar", type: "text", required: true },
    { label: "Jornada de Trabajo", name: "jt", type: "text", required: false },
    { label: "Actividad", name: "actividad", type: "text", required: true },
    { label: "Resultado", name: "resultado", type: "text", required: true },
    { label: "Bloque", name: "bloque", type: "text", required: false },
  ]
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const NOTIFICATION_DURATION = 3000;

export const TABLE_HEADERS = {
  hallazgos: [
    { key: 'fecha_inspeccion', label: 'Fecha Inspección', sortable: true },
    { key: 'proyecto', label: 'Proyecto', sortable: true },
    { key: 'evaluador', label: 'Evaluador', sortable: true },
    { key: 'zona', label: 'Zona', sortable: true },
    { key: 'resultado', label: 'Resultado', sortable: false },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'permisos', label: 'Permisos', sortable: false },
    { key: 'acciones', label: 'Acciones', sortable: false }
  ]
};

export const CALENDAR_CONFIG = {
  weekDays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  monthNames: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
};

export const FILE_TYPES = {
  CSV: 'text/csv',
  EXCEL: 'application/vnd.ms-excel',
  EXCEL_MODERN: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

export const ACCEPTED_FILE_EXTENSIONS = '.xlsx,.xls,.csv';

export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: {
    icon: 'text-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  [USER_ROLES.EDITOR]: {
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800'
  },
  [USER_ROLES.USER]: {
    icon: 'text-gray-500',
    badge: 'bg-gray-100 text-gray-800'
  }
};

export const STATUS_COLORS = {
  [HALLAZGO_ESTADOS.ABIERTO]: 'bg-yellow-100 text-yellow-800',
  [HALLAZGO_ESTADOS.CERRADO]: 'bg-green-100 text-green-800'
};

export const PERMISSION_COLORS = {
  canEdit: 'bg-blue-100 text-blue-800',
  readOnly: 'bg-gray-100 text-gray-800'
};