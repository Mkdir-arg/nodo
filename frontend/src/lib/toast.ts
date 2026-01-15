// Simple toast implementation
import { useToast as useToastUI } from '@/components/ui/toast';

export const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
};

export { useToastUI as useToast };