import Dexie, { type Table } from 'dexie';

export interface OfflineTicket {
  id?: number;
  payload: any;
  timestamp: number;
}

export class TicketSyncDB extends Dexie {
  offlineTickets!: Table<OfflineTicket, number>;

  constructor() {
    super('TicketSyncDB');
    this.version(1).stores({
      offlineTickets: '++id, timestamp',
    });
  }
}

export const db = new TicketSyncDB();
