"use client";

import { useState } from "react";
import { Users, Shield, Settings } from "lucide-react";
import UserManagement from "./_UserManagement";
import GroupManagement from "./_GroupManagement";
import SystemSettings from "./_SystemSettings";

const tabs = [
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "grupos", label: "Grupos", icon: Shield },
  { id: "sistema", label: "Sistema", icon: Settings }
];

export default function ConfiguracionesPage() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuraciones</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Gestiona usuarios, grupos y configuración del sistema</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "usuarios" && <UserManagement />}
            {activeTab === "grupos" && <GroupManagement />}
            {activeTab === "sistema" && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}