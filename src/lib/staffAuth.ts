import { STAFF_ROLES } from './staffConfig';

export const setStaffRole = (role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('staffRole', role);
    document.cookie = `__session_role=${role}; path=/; max-age=86400; SameSite=Strict`;
  }
};

export const getStaffRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('staffRole');
  }
  return null;
};

export const clearStaffRole = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('staffRole');
  }
};
