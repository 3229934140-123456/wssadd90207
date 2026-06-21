import { create } from 'zustand';
import type { Customer, Treatment, InjectionPoint, Photo, Reminder, TabName, TemplateView, FaceSide } from '@/types';
import { db } from '@/db';

interface AppState {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;

  customers: Customer[];
  loadCustomers: () => Promise<void>;
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: number, c: Partial<Customer>) => Promise<void>;

  selectedCustomerId: number | null;
  setSelectedCustomerId: (id: number | null) => void;

  treatments: Treatment[];
  loadTreatments: (customerId: number) => Promise<void>;
  loadAllTreatments: () => Promise<void>;
  addTreatment: (t: Omit<Treatment, 'id' | 'createdAt'>) => Promise<Treatment>;
  updateTreatment: (id: number, t: Partial<Treatment>) => Promise<void>;

  selectedTreatmentId: number | null;
  setSelectedTreatmentId: (id: number | null) => void;

  points: InjectionPoint[];
  loadPoints: (treatmentId: number) => Promise<void>;
  addPoint: (p: Omit<InjectionPoint, 'id'>) => Promise<InjectionPoint>;
  updatePoint: (id: number, p: Partial<InjectionPoint>) => Promise<void>;
  deletePoint: (id: number) => Promise<void>;

  selectedPointId: number | null;
  setSelectedPointId: (id: number | null) => void;

  templateView: TemplateView;
  setTemplateView: (v: TemplateView) => void;

  faceSide: FaceSide;
  setFaceSide: (s: FaceSide) => void;

  photos: Photo[];
  loadPhotos: (treatmentId: number) => Promise<void>;
  addPhoto: (p: Omit<Photo, 'id'>) => Promise<void>;
  deletePhoto: (id: number) => Promise<void>;

  reminders: Reminder[];
  loadReminders: () => Promise<void>;
  addReminder: (r: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: number, r: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'customers',
  setActiveTab: (tab) => set({ activeTab: tab }),

  customers: [],
  loadCustomers: async () => {
    const customers = await db.customers.orderBy('createdAt').reverse().toArray();
    set({ customers });
  },
  addCustomer: async (c) => {
    const now = new Date().toISOString();
    const id = await db.customers.add({ ...c, createdAt: now, updatedAt: now });
    await get().loadCustomers();
    return { ...c, id, createdAt: now, updatedAt: now } as Customer;
  },
  updateCustomer: async (id, c) => {
    await db.customers.update(id, { ...c, updatedAt: new Date().toISOString() });
    await get().loadCustomers();
  },

  selectedCustomerId: null,
  setSelectedCustomerId: (id) => {
    set({ selectedCustomerId: id, selectedTreatmentId: null, treatments: [], points: [], photos: [] });
    if (id) get().loadTreatments(id);
  },

  treatments: [],
  loadTreatments: async (customerId) => {
    const treatments = await db.treatments.where('customerId').equals(customerId).reverse().sortBy('date');
    set({ treatments });
  },
  loadAllTreatments: async () => {
    const treatments = await db.treatments.orderBy('date').reverse().toArray();
    set({ treatments });
  },
  addTreatment: async (t) => {
    const id = await db.treatments.add({ ...t, createdAt: new Date().toISOString() });
    await get().loadTreatments(t.customerId);
    return { ...t, id, createdAt: new Date().toISOString() } as Treatment;
  },
  updateTreatment: async (id, t) => {
    await db.treatments.update(id, t);
    const cid = get().selectedCustomerId;
    if (cid) await get().loadTreatments(cid);
  },

  selectedTreatmentId: null,
  setSelectedTreatmentId: (id) => {
    set({ selectedTreatmentId: id, points: [], photos: [], selectedPointId: null });
    if (id) {
      get().loadPoints(id);
      get().loadPhotos(id);
    }
  },

  points: [],
  loadPoints: async (treatmentId) => {
    const points = await db.injectionPoints.where('treatmentId').equals(treatmentId).toArray();
    set({ points });
  },
  addPoint: async (p) => {
    const id = await db.injectionPoints.add(p);
    await get().loadPoints(p.treatmentId);
    return { ...p, id } as InjectionPoint;
  },
  updatePoint: async (id, p) => {
    await db.injectionPoints.update(id, p);
    const tid = get().selectedTreatmentId;
    if (tid) await get().loadPoints(tid);
  },
  deletePoint: async (id) => {
    await db.injectionPoints.delete(id);
    const tid = get().selectedTreatmentId;
    if (tid) await get().loadPoints(tid);
  },

  selectedPointId: null,
  setSelectedPointId: (id) => set({ selectedPointId: id }),

  templateView: 'front',
  setTemplateView: (v) => set({ templateView: v }),

  faceSide: 'full',
  setFaceSide: (s) => set({ faceSide: s }),

  photos: [],
  loadPhotos: async (treatmentId) => {
    const photos = await db.photos.where('treatmentId').equals(treatmentId).toArray();
    set({ photos });
  },
  addPhoto: async (p) => {
    await db.photos.add(p);
    await get().loadPhotos(p.treatmentId);
  },
  deletePhoto: async (id) => {
    await db.photos.delete(id);
    const tid = get().selectedTreatmentId;
    if (tid) await get().loadPhotos(tid);
  },

  reminders: [],
  loadReminders: async () => {
    const reminders = await db.reminders.orderBy('remindDate').toArray();
    set({ reminders });
  },
  addReminder: async (r) => {
    await db.reminders.add(r);
    await get().loadReminders();
  },
  updateReminder: async (id, r) => {
    await db.reminders.update(id, r);
    await get().loadReminders();
  },
  deleteReminder: async (id) => {
    await db.reminders.delete(id);
    await get().loadReminders();
  },
}));
