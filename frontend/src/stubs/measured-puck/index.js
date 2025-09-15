"use strict";

exports.version = "0.0.0-development";

function unsupported(name) {
  throw new Error(`@measured/puck stub: ${name} no está disponible en el entorno de pruebas.`);
}

exports.createPuck = function createPuck() {
  unsupported("createPuck");
};

exports.Editor = function Editor() {
  unsupported("Editor");
  return null;
};
