export interface DropdownItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  description?: string;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  maxHeight?: string;
  loading?: boolean;
  emptyMessage?: string;
  openOnHover?: boolean;
  showSearch?: boolean;
}

export type DropdownPlacement = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';