import AuthModel from '../models/AuthModel.js';

class AuthController {
    constructor(authModel) {
        if (!(authModel instanceof AuthModel)) {
            throw new Error('AuthController requires an instance of AuthModel');
        }
        this.model = authModel;
        this.listeners = [];
    }

  addListener(callback) {
    this.listeners.push(callback);
  }
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  async handleCompanyValidation(companyName) {
    const isValid = await this.model.validateCompany(companyName);

    if (isValid) {
      this.notifyListeners();
      return { success: true, step: 'login' };
    }

    return { success: false, error: 'Empresa no encontrada' };
  }

  async handleUserLogin(usuario, contraseña, empresaId) {
    if (!this.model.currentCompany) {
      return { success: false, error: 'Debe ingresar una empresa válida primero' };
    }

    const isValid = await this.model.login(usuario, contraseña, empresaId);
    if (isValid) {
      this.notifyListeners();
      return { success: true, step: 'dashboard' };
    }

    return { success: false, error: 'Credenciales inválidas' };
  }

  handleLogout() {
    this.model.logout();
    this.notifyListeners();
    return { success: true, step: 'company' };
  }

  getCurrentState() {
    return {
      isAuthenticated: this.model.isAuthenticated,
      currentUser: this.model.currentUser,
      currentCompany: this.model.currentCompany
    };
  }
}
export default AuthController