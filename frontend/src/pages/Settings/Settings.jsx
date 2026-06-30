import React from 'react';
import { Link } from 'react-router-dom';
import { MonitorSmartphone, Shield, Bell, User, ChevronRight } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';

export default function Settings() {
  const sections = [
    {
      title: 'Connected Devices',
      description: 'Manage and sync playback across your authorized devices.',
      icon: <MonitorSmartphone size={24} className="text-blue-400" />,
      link: '/settings/devices'
    },
    {
      title: 'Account Settings',
      description: 'Update your profile and subscription details.',
      icon: <User size={24} className="text-pink-400" />,
      link: '#'
    },
    {
      title: 'Privacy & Security',
      description: 'Manage data permissions and security settings.',
      icon: <Shield size={24} className="text-green-400" />,
      link: '#'
    },
    {
      title: 'Notifications',
      description: 'Configure email and push notification preferences.',
      icon: <Bell size={24} className="text-yellow-400" />,
      link: '#'
    }
  ];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Settings</h1>
          <p className="text-beatly-text-muted text-lg">Manage your Beatly experience and connected devices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <Link 
              key={index}
              to={section.link}
              className={`block bg-beatly-surface p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all ${section.link === '#' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}`}
              onClick={(e) => section.link === '#' && e.preventDefault()}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                    <p className="text-sm text-beatly-text-muted leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
                {section.link !== '#' && <ChevronRight className="text-beatly-text-muted mt-2" />}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
