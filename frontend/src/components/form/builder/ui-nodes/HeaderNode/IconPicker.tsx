import { useState } from 'react';
import { 
  User, Printer, MapPin, List, Bell, Settings, LogOut, Home, 
  Phone, Mail, Calendar, FileText, Download, Upload, Search,
  Edit, Trash2, Plus, Minus, Check, X, Heart, Star,
  Share, Copy, Eye, EyeOff, Lock, Unlock, Camera, Image
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ICONS = {
  // UI & Navigation
  user: User,
  home: Home,
  settings: Settings,
  search: Search,
  menu: List,
  
  // Actions
  printer: Printer,
  download: Download,
  upload: Upload,
  edit: Edit,
  trash: Trash2,
  copy: Copy,
  share: Share,
  
  // Communication
  phone: Phone,
  mail: Mail,
  bell: Bell,
  
  // Content
  'file-text': FileText,
  calendar: Calendar,
  image: Image,
  camera: Camera,
  
  // Location & Map
  'map-pin': MapPin,
  
  // Status & Feedback
  check: Check,
  x: X,
  heart: Heart,
  star: Star,
  
  // Utility
  plus: Plus,
  minus: Minus,
  eye: Eye,
  'eye-off': EyeOff,
  lock: Lock,
  unlock: Unlock,
  'log-out': LogOut,
};

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = Object.entries(ICONS).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = ICONS[value as keyof typeof ICONS] || User;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start mt-1"
      >
        <SelectedIcon size={16} className="mr-2" />
        {value}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-3">
          <Input
            placeholder="Buscar icono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {filteredIcons.map(([name, IconComponent]) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                }}
                className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center ${
                  value === name ? 'bg-blue-100 border border-blue-300' : ''
                }`}
                title={name}
              >
                <IconComponent size={16} />
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No se encontraron iconos
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}