import { ApiRepo, ITemplatesRepo } from "./api-repo";
import { LocalRepo } from "./local-repo";

class SimpleRepo implements ITemplatesRepo {
  private apiRepo = new ApiRepo();
  private localRepo = new LocalRepo();

  private isAuthenticated(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('access_token');
  }

  async listTemplates() {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.listTemplates();
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.listTemplates();
  }

  async getTemplate(id: string) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.getTemplate(id);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.getTemplate(id);
  }

  async upsertTemplate(t: any) {
    console.log('📝 PASO 1: Datos recibidos en repositorio:', JSON.stringify(t, null, 2));
    
    if (this.isAuthenticated()) {
      try {
        console.log('🚀 PASO 2: Guardando en backend...');
        const result = await this.apiRepo.upsertTemplate(t);
        console.log('✅ PASO 3: Guardado en backend exitoso:', JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.error('❌ PASO 3: Error backend:', error);
        console.log('💾 PASO 4: Guardando en local como fallback');
      }
    } else {
      console.log('🔒 PASO 2: No autenticado, guardando en local');
    }
    
    console.log('💾 PASO 4: Usando repositorio local');
    const localResult = await this.localRepo.upsertTemplate(t);
    console.log('✅ PASO 5: Guardado en local exitoso:', JSON.stringify(localResult, null, 2));
    return localResult;
  }

  async publishTemplate(id: string) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.publishTemplate(id);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.publishTemplate(id);
  }

  async cloneTemplate(id: string) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.cloneTemplate(id);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.cloneTemplate(id);
  }

  async listDossiers() {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.listDossiers();
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.listDossiers();
  }

  async createDossier(d: any) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.createDossier(d);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.createDossier(d);
  }

  async getDossier(id: string) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.getDossier(id);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.getDossier(id);
  }

  async saveDossier(d: any) {
    if (this.isAuthenticated()) {
      try {
        return await this.apiRepo.saveDossier(d);
      } catch (error) {
        console.warn('API falló, usando local:', error);
      }
    }
    return this.localRepo.saveDossier(d);
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