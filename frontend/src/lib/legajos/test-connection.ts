import { apiUrl } from "@/services/api";

// Script de prueba para verificar la conexion con el backend
export async function testBackendConnection() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No hay token de autenticacion");
    return false;
  }

  try {
    const response = await fetch(apiUrl("plantillas/"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Conexion exitosa con el backend");
      console.log("Plantillas existentes:", data);
      return true;
    }
    console.error("Error de respuesta:", response.status, response.statusText);
    return false;
  } catch (error) {
    console.error("Error de conexion:", error);
    return false;
  }
}

export async function testCreateTemplate() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No hay token de autenticacion");
    return false;
  }

  const testTemplate = {
    nombre: `Test Frontend ${new Date().toISOString()}`,
    descripcion: "Plantilla creada desde el frontend",
    schema: {
      type: "object",
      properties: {
        nombre: { type: "string", title: "Nombre" },
        edad: { type: "number", title: "Edad" },
      },
    },
  };

  try {
    const response = await fetch(apiUrl("plantillas/"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testTemplate),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Plantilla creada exitosamente:", data);
      return data;
    }
    const errorText = await response.text();
    console.error("Error al crear plantilla:", response.status, errorText);
    return false;
  } catch (error) {
    console.error("Error de conexion al crear plantilla:", error);
    return false;
  }
}

// Exponer funciones globalmente para testing
if (typeof window !== "undefined") {
  (window as any).testBackend = {
    testConnection: testBackendConnection,
    testCreate: testCreateTemplate,
  };
}
