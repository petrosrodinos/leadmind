import { Command } from 'lucide-react';
import { environments } from '@/config/environments';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-900">
        <Command className="h-5 w-5" />
        {environments.APP_NAME}
      </Link>
    </header>
  );
}
