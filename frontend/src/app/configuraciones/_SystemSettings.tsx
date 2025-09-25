"use client";

import { useState, useEffect } from "react";
import { getJSON, postJSON } from "@/lib/api";
import { clearLoginSettingsCache } from "@/lib/loginSettings";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "Nodo",
    maxFileSize: "10",
    allowRegistration: false,
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: "daily",
    loginImage: "/png/people-connecting.png",
    loginTitle: "Bienvenido a Nodo,",
    loginSubtitle: "tu Sistema Social",
    loginFooterTitle: "Nodo",
    loginFooterSubtitle: "Powered by ICore"
  });
  
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    database: 'MySQL',
    active_users: 0,
    total_users: 0,
    last_backup: 'Nunca',
    disk_usage: '0 GB',
    memory_usage: '0 MB'
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getJSON('/system/settings/');
      setSettings(data);
      setImagePreview(data.loginImage);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const data = await getJSON('/system/info/');
      setSystemInfo(data);
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  const [imagePreview, setImagePreview] = useState(settings.loginImage);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setSettings({...settings, loginImage: result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await postJSON('/system/settings/update/', settings);
      clearLoginSettingsCache(); // Limpiar cache para que se recarguen
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuración General */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño Máximo de Archivo (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Usuarios */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                  className="mr-2"
                />
                Permitir registro de nuevos usuarios
              </label>
            </div>
          </div>

          {/* Configuración del Sistema */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sistema</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="mr-2"
                />
                Modo mantenimiento
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="mr-2"
                />
                Notificaciones por email
              </label>
            </div>
          </div>

          {/* Configuración de Login */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Página de Login</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de Login
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, SVG. Tamaño recomendado: 700x500px</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={settings.loginTitle}
                    onChange={(e) => setSettings({...settings, loginTitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={settings.loginSubtitle}
                    onChange={(e) => setSettings({...settings, loginSubtitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Footer
                  </label>
                  <input
                    type="text"
                    value={settings.loginFooterTitle}
                    onChange={(e) => setSettings({...settings, loginFooterTitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo del Footer
                  </label>
                  <input
                    type="text"
                    value={settings.loginFooterSubtitle}
                    onChange={(e) => setSettings({...settings, loginFooterSubtitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista Previa
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="text-center mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-32 object-contain mx-auto rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/png/people-connecting.png';
                      }}
                    />
                  </div>
                  <div className="text-sm">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {settings.loginTitle}<br />
                      {settings.loginSubtitle}
                    </h4>
                    <div className="mt-3 text-right">
                      <div className="font-bold text-blue-600">{settings.loginFooterTitle}</div>
                      <div className="text-xs text-gray-500">{settings.loginFooterSubtitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Respaldos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Respaldos</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Respaldo
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="never">Nunca</option>
              </select>
            </div>
          </div>

          {/* Información del Sistema */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Versión:</span> {systemInfo.version}
                </div>
                <div>
                  <span className="font-medium">Base de datos:</span> {systemInfo.database}
                </div>
                <div>
                  <span className="font-medium">Usuarios activos:</span> {systemInfo.active_users}
                </div>
                <div>
                  <span className="font-medium">Total usuarios:</span> {systemInfo.total_users}
                </div>
                <div>
                  <span className="font-medium">Último respaldo:</span> {systemInfo.last_backup}
                </div>
                <div>
                  <span className="font-medium">Uso de disco:</span> {systemInfo.disk_usage}
                </div>
                <div>
                  <span className="font-medium">Uso de memoria:</span> {systemInfo.memory_usage}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Guardando...' : 'Guardar Configuraciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}