'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../icons';
import { cn } from '@/shared/utils/cn';
import { DropdownProps, DropdownItem } from './types/dropdown.types';

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  placement = 'bottom-left',
  maxHeight = 'max-h-80',
  loading = false,
  emptyMessage = 'No items available',
  openOnHover = false,
  showSearch = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMouseEnter = () => {
    if (openOnHover) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !openOnHover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, openOnHover]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getDropdownPosition = () => {
    switch (placement) {
      case 'bottom-right':
        return 'top-full right-0 mt-2';
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      default:
        return 'top-full left-0 mt-2';
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'inline-flex items-center justify-between w-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
          triggerClassName
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={openOnHover ? undefined : () => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 origin-top-left transition-all duration-200 ease-out',
            'transform scale-100 opacity-100',
            'bg-white border border-gray-200 rounded-lg shadow-2xl',
            'w-80 overflow-hidden',
            getDropdownPosition(),
            dropdownClassName
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {showSearch && !loading && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="px-4 py-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-2">Loading categories...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-sm text-gray-500 text-center">
              {searchTerm ? `No categories found for "${searchTerm}"` : emptyMessage}
            </div>
          ) : (
            <div
              className={cn(
                'py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
                maxHeight
              )}
            >
              {showSearch && searchTerm && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-50">
                  {filteredItems.length} categories found
                </div>
              )}

              {filteredItems.map((item, index) => (
                <button
                  key={item.id || index}
                  className="group flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-900 transition-all duration-150"
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <div className="mr-3 flex-shrink-0 text-gray-400 group-hover:text-amber-600">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span className="ml-2 -rotate-90 w-3 h-3 text-gray-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <ChevronDownIcon />
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && filteredItems.length > 10 && !showSearch && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 text-center">
              Showing {Math.min(filteredItems.length, 50)} of {items.length} categories
            </div>
          )}
        </div>
      )}
    </div>
  );
};
