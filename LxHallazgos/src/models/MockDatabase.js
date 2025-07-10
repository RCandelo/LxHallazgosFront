const MockDatabase = {
  users: [
    {
      id: 1,
      name: 'admin',
      email: 'admin@empresa1.com',
      role: 'admin',
      password: '1234',
      company: 'empresa1',
      nombre: 'Administrador',
      rol: 'admin',
      puede_editar: true,
      empresa_id: 1
    },
    {
      id: 2,
      name: 'editor',
      email: 'editor@empresa2.com',
      role: 'editor',
      password: 'abcd',
      company: 'empresa2',
      nombre: 'Editor',
      rol: 'editor',
      puede_editar: true,
      empresa_id: 2
    },
    {
      id: 3,
      name: 'usuario1',
      email: 'usuario@empresa1.com',
      role: 'usuario',
      password: 'pass',
      company: 'empresa1',
      nombre: 'Paola Vargas',
      rol: 'usuario',
      puede_editar: false,
      empresa_id: 1
    },
    {
      id: 4,
      name: 'usuario2',
      email: 'usuario@empresa1.com',
      role: 'usuario',
      password: 'pass',
      company: 'empresa1',
      nombre: 'Javier Gandola',
      rol: 'usuario',
      puede_editar: false,
      empresa_id: 1
    }
  ],

  hallazgos: [
    {
      id: '218659943',
      evaluador: 'Paola Vargas',
      fecha: '2025-01-06T11:45:00',
      fecha_inspeccion: '2025-01-06',
      tipo: 'Supervisor Mantenimiento',
      zona: 'Acuario',
      departamento: 'MANTENIMIENTO CORRECTIVO',
      actividad: 'Corte de Suministro BT',
      resultado: 'NC',
      estado: 'pendiente',
      proyecto: 'Proyecto Alpha',
      jt: 'JT001',
      bloque: 'Bloque A',
      observaciones: 'Requiere atención inmediata',
      descripcion: 'Problema con el suministro eléctrico',
      usuario_id: 3,
      empresa_id: 1
    },
    {
      id: '219581583',
      evaluador: 'Paola Vargas',
      fecha: '2025-01-08T12:25:00',
      fecha_inspeccion: '2025-01-08',
      tipo: 'Supervisor Medidas',
      zona: 'Metro',
      departamento: 'MANTENIMIENTO CORRECTIVO',
      actividad: 'Línea caída',
      resultado: 'NC',
      estado: 'pendiente',
      proyecto: 'Proyecto Beta',
      jt: 'JT002',
      bloque: 'Bloque B',
      observaciones: 'Línea en el suelo',
      descripcion: 'Cable de alimentación caído',
      usuario_id: 3,
      empresa_id: 1
    },
    {
      id: '218662660',
      evaluador: 'Javier Gandola',
      fecha: '2025-01-27T11:49:00',
      fecha_inspeccion: '2025-01-27',
      tipo: 'Técnico PRL',
      zona: 'Oeste 1',
      departamento: 'MEDIDAS',
      actividad: 'Suspensión de suministro por no pago (corte)',
      resultado: 'NC',
      estado: 'cerrado',
      proyecto: 'Proyecto Gamma',
      jt: 'JT003',
      bloque: 'Bloque C',
      observaciones: 'Cliente moroso',
      descripcion: 'Procedimiento de corte por falta de pago',
      usuario_id: 4,
      empresa_id: 1
    },
    {
      id: '220123456',
      evaluador: 'Admin Test',
      fecha: '2025-01-10T10:30:00',
      fecha_inspeccion: '2025-01-10',
      tipo: 'Supervisor General',
      zona: 'Centro',
      departamento: 'SUPERVISION',
      actividad: 'Inspección general',
      resultado: 'C',
      estado: 'pendiente',
      proyecto: 'Proyecto Delta',
      jt: 'JT004',
      bloque: 'Bloque D',
      observaciones: 'Todo correcto',
      descripcion: 'Inspección rutinaria',
      usuario_id: 1,
      empresa_id: 1
    }
  ],

  findUserByCredentials(username, password, company) {
    return this.users.find(
      user =>
        user.name === username &&
        user.password === password &&
        user.company === company
    );
  },

  getHallazgosByUserId(userId) {
    return this.hallazgos.filter(h => h.usuario_id === userId);
  },

  getHallazgosByEmpresaId(empresaId) {
    return this.hallazgos.filter(h => h.empresa_id === empresaId);
  },

  getAllHallazgos() {
    return this.hallazgos;
  },

  getUsers() {
    return this.users;
  },

  getUsersByEmpresaId(empresaId) {
    return this.users.filter(u => u.empresa_id === empresaId);
  },

  updateHallazgoEstado(id, estado) {
    const hallazgo = this.hallazgos.find(h => h.id === id);
    if (hallazgo) {
      hallazgo.estado = estado;
      return true;
    }
    return false;
  },

  createHallazgo(hallazgoData) {
    const newId = Date.now().toString();
    const now = new Date();
    const newHallazgo = {
      ...hallazgoData,
      id: newId,
      fecha: now.toISOString(),
      fecha_inspeccion: now.toISOString().split('T')[0]
    };
    this.hallazgos.unshift(newHallazgo);
    return newHallazgo;
  },

  updateHallazgo(id, hallazgoData) {
    const index = this.hallazgos.findIndex(h => h.id === id);
    if (index !== -1) {
      this.hallazgos[index] = { ...this.hallazgos[index], ...hallazgoData };
      return this.hallazgos[index];
    }
    return null;
  }
};

export default MockDatabase;
