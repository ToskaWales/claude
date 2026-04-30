import { useState } from 'react';
import AvailabilityTab from './AvailabilityTab';
import BookingsTab from './BookingsTab';
import ServicesTab from './ServicesTab';
import SettingsTab from './SettingsTab';

type Tab = 'bookings' | 'availability' | 'services' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'bookings', label: 'Termine', icon: '📅' },
  { id: 'availability', label: 'Verfügbarkeit', icon: '🕐' },
  { id: 'services', label: 'Leistungen', icon: '✂️' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Verwaltung</h1>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && <BookingsTab />}
      {activeTab === 'availability' && <AvailabilityTab />}
      {activeTab === 'services' && <ServicesTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
