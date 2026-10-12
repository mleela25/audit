import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Home, Users, BookOpen, ClipboardList, GraduationCap, BarChart3, FileText, Settings } from 'lucide-react';
import { clsx } from 'clsx';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home },
  { name: 'Students', href: 'students', icon: Users },
  { name: 'Classwork', href: 'classwork', icon: BookOpen },
  { name: 'Homework', href: 'homework', icon: ClipboardList },
  { name: 'Tests', href: 'tests', icon: GraduationCap },
  { name: 'Analytics', href: 'analytics', icon: BarChart3 },
  { name: 'Reports', href: 'reports', icon: FileText },
  { name: 'Settings', href: 'settings', icon: Settings },
];

export default function MobileNav({ isOpen, onClose, activeTab, onTabChange }: MobileNavProps) {
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-xl font-bold text-gray-900">EduManage</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = activeTab === item.href;
                          return (
                            <li key={item.name}>
                              <button
                                onClick={() => handleTabChange(item.href)}
                                className={clsx(
                                  isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50',
                                  'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}