import { useEffect, useRef } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const debouncedData = useDebouncedValue(data, delay);
  const initialRender = useRef(true);
  const lastSavedData = useRef(data);

  useEffect(() => {
    if (!enabled) return;
    
    // Skip initial render
    if (initialRender.current) {
      initialRender.current = false;
      lastSavedData.current = debouncedData;
      return;
    }

    // Skip if data hasn't changed
    if (JSON.stringify(lastSavedData.current) === JSON.stringify(debouncedData)) {
      return;
    }

    // Auto-save
    const save = async () => {
      try {
        await onSave(debouncedData);
        lastSavedData.current = debouncedData;
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    save();
  }, [debouncedData, onSave, enabled]);
}