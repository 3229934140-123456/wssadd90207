import Dexie, { type Table } from 'dexie';
import type { Customer, Treatment, InjectionPoint, Photo, Reminder } from '@/types';

class AppDatabase extends Dexie {
  customers!: Table<Customer, number>;
  treatments!: Table<Treatment, number>;
  injectionPoints!: Table<InjectionPoint, number>;
  photos!: Table<Photo, number>;
  reminders!: Table<Reminder, number>;

  constructor() {
    super('InjectionRecorderDB');
    this.version(1).stores({
      customers: '++id, name, phone, createdAt',
      treatments: '++id, customerId, status, date',
      injectionPoints: '++id, treatmentId, pointNumber, templateView',
      photos: '++id, treatmentId, type, takenAt',
      reminders: '++id, treatmentId, customerId, remindDate, completed',
    });
  }
}

export const db = new AppDatabase();

export async function exportAllData() {
  const customers = await db.customers.toArray();
  const treatments = await db.treatments.toArray();
  const injectionPoints = await db.injectionPoints.toArray();
  const photos = await db.photos.toArray();
  const reminders = await db.reminders.toArray();
  return JSON.stringify({ customers, treatments, injectionPoints, photos, reminders }, null, 2);
}

export async function importAllData(json: string) {
  const data = JSON.parse(json);
  await db.transaction('rw', [db.customers, db.treatments, db.injectionPoints, db.photos, db.reminders], async () => {
    await db.customers.clear();
    await db.treatments.clear();
    await db.injectionPoints.clear();
    await db.photos.clear();
    await db.reminders.clear();
    if (data.customers?.length) await db.customers.bulkAdd(data.customers);
    if (data.treatments?.length) await db.treatments.bulkAdd(data.treatments);
    if (data.injectionPoints?.length) await db.injectionPoints.bulkAdd(data.injectionPoints);
    if (data.photos?.length) await db.photos.bulkAdd(data.photos);
    if (data.reminders?.length) await db.reminders.bulkAdd(data.reminders);
  });
}
