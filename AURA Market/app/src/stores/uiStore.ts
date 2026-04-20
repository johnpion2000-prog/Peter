import { create } from 'zustand';

interface UIStore {
  isAddProductOpen: boolean;
  isEditProductOpen: boolean;
  editProductId: string | null;
  isAddCompanyOpen: boolean;
  isEditCompanyOpen: boolean;
  editCompanyId: string | null;
  isOrderDetailOpen: boolean;
  selectedOrderId: string | null;
  sidebarOpen: boolean;

  openAddProduct: () => void;
  closeAddProduct: () => void;
  openEditProduct: (id: string) => void;
  closeEditProduct: () => void;
  openAddCompany: () => void;
  closeAddCompany: () => void;
  openEditCompany: (id: string) => void;
  closeEditCompany: () => void;
  openOrderDetail: (id: string) => void;
  closeOrderDetail: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAddProductOpen: false,
  isEditProductOpen: false,
  editProductId: null,
  isAddCompanyOpen: false,
  isEditCompanyOpen: false,
  editCompanyId: null,
  isOrderDetailOpen: false,
  selectedOrderId: null,
  sidebarOpen: true,

  openAddProduct: () => set({ isAddProductOpen: true }),
  closeAddProduct: () => set({ isAddProductOpen: false }),
  openEditProduct: (id) => set({ isEditProductOpen: true, editProductId: id }),
  closeEditProduct: () => set({ isEditProductOpen: false, editProductId: null }),
  openAddCompany: () => set({ isAddCompanyOpen: true }),
  closeAddCompany: () => set({ isAddCompanyOpen: false }),
  openEditCompany: (id) => set({ isEditCompanyOpen: true, editCompanyId: id }),
  closeEditCompany: () => set({ isEditCompanyOpen: false, editCompanyId: null }),
  openOrderDetail: (id) => set({ isOrderDetailOpen: true, selectedOrderId: id }),
  closeOrderDetail: () => set({ isOrderDetailOpen: false, selectedOrderId: null }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
