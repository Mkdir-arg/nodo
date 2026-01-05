import { ApiRepo, ITemplatesRepo } from "./api-repo";

class SimpleRepo implements ITemplatesRepo {
  private apiRepo = new ApiRepo();

  private isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  }

  async listTemplates() {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para ver plantillas.');
    }
    return await this.apiRepo.listTemplates();
  }

  async getTemplate(id: string) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para ver plantillas.');
    }
    return await this.apiRepo.getTemplate(id);
  }

  async upsertTemplate(t: any) {
    console.log('📝 PASO 1: Datos recibidos en repositorio:', JSON.stringify(t, null, 2));
    
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para guardar plantillas.');
    }

    console.log('🚀 PASO 2: Guardando en backend...');
    const result = await this.apiRepo.upsertTemplate(t);
    console.log('✅ PASO 3: Guardado en backend exitoso:', JSON.stringify(result, null, 2));
    return result;
  }

  async publishTemplate(id: string) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para publicar plantillas.');
    }
    return await this.apiRepo.publishTemplate(id);
  }

  async cloneTemplate(id: string) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para clonar plantillas.');
    }
    return await this.apiRepo.cloneTemplate(id);
  }

  async listDossiers() {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para ver legajos.');
    }
    return await this.apiRepo.listDossiers();
  }

  async createDossier(d: any) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para crear legajos.');
    }
    return await this.apiRepo.createDossier(d);
  }

  async getDossier(id: string) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para ver legajos.');
    }
    return await this.apiRepo.getDossier(id);
  }

  async saveDossier(d: any) {
    if (!this.isAuthenticated()) {
      throw new Error('No autenticado. Inicia sesión para guardar legajos.');
    }
    return await this.apiRepo.saveDossier(d);
  }
}

export const repo: ITemplatesRepo = new SimpleRepo();

// Debug tools
if (typeof window !== 'undefined') {
  (window as any).debug = {
    checkAuth: () => !!localStorage.getItem('access_token'),
    getToken: () => localStorage.getItem('access_token'),
    testApi: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return 'No token';
      try {
        const res = await fetch('http://localhost:8000/api/plantillas/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? 'API OK' : `Error ${res.status}`;
      } catch (e) {
        return `Error: ${e}`;
      }
    }
  };
}