"use client";

import { useState } from "react";
import UserManagement from "./_UserManagement";

export default function ConfiguracionesPage() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuraciones</h1>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "usuarios"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("grupos")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "grupos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab("sistema")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sistema"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sistema
          </button>
        </nav>
      </div>

      {activeTab === "usuarios" && <UserManagement />}
      {activeTab === "grupos" && <div className="p-4 text-gray-500">Gestión de grupos - Próximamente</div>}
      {activeTab === "sistema" && <div className="p-4 text-gray-500">Configuración del sistema - Próximamente</div>}
    </div>
  );
}