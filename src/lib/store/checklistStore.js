import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { createChecklistSlice } from './slices/checklistSlice';
import { createItemSlice } from './slices/itemSlice';
import { createProgressSlice } from './slices/progressSlice';

export const useChecklistStore = create(
  persist(
    (set, get) => ({
      ...createChecklistSlice(set, get),
      ...createItemSlice(set, get),
      ...createProgressSlice(set, get),
    }),
    {
      name: 'checklists',
      storage: createJSONStorage(() => ({
        getItem: (k) => Cookies.get(k) ?? null,
        setItem: (k, v) => Cookies.set(k, v, { expires: 30 }),
        removeItem: (k) => Cookies.remove(k),
      })),
    }
  )
);
