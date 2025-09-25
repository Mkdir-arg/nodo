'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';

interface InactivityWarningProps {
  isVisible: boolean;
  remainingSeconds: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export function InactivityWarning({
  isVisible,
  remainingSeconds,
  onExtendSession,
  onLogout
}: InactivityWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sesión por expirar
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Tu sesión expirará en <strong>{remainingSeconds}</strong> segundos por inactividad.
          </p>
          <div className="flex space-x-3 justify-center">
            <Button
              onClick={onExtendSession}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Extender sesión
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="text-gray-700 border-gray-300"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}