import { defineStore } from 'pinia';

export type RushProfile = {
  originAirport: string;
  passportNameEn: string;
  passportNumber: string;
  passportExpiry: string; // ISO date
  preferredAirline?: string;
  seatClass?: 'ECONOMY' | 'BUSINESS';
  paymentCardMasked?: string; // e.g., VISA •••• 1234
};

export type BookingOffer = {
  airline?: string;
  flightNumber: string;
  departTime: string; // ISO
  arriveTime: string; // ISO
  seatClass: 'ECONOMY' | 'BUSINESS';
  totalPrice: number; // in KRW
  currency: 'KRW' | 'USD' | 'CNY';
  highDemand?: boolean;
};

export type BookingState =
  | { status: 'NONE' }
  | { status: 'OFFERED'; offer: BookingOffer }
  | { status: 'CONFIRMED'; offer: BookingOffer; reservationCode: string }
  | { status: 'TICKETED'; offer: BookingOffer; reservationCode: string; eTicketNumber: string };

export type RushState = {
  isActive: boolean;
  endAt?: string; // ISO timestamp
};

export type NotificationItem = {
  id: string;
  createdAt: string; // ISO
  title: string;
  body: string;
};

export type User = {
  id: string;
  name: string;
  provider: 'twitter' | 'google' | 'guest';
};

export type FanRushState = {
  user?: User;
  profile?: RushProfile;
  rush: RushState;
  booking: BookingState;
  notifications: NotificationItem[];
  pastReservations: Array<{ reservationCode: string; eTicketNumber?: string; offer: BookingOffer; bookedAt: string }>;
};

const STORAGE_KEY = 'fanrush_state_v1';

function saveToStorage(state: FanRushState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore quota or SSR
  }
}

function loadFromStorage(): FanRushState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as FanRushState;
  } catch (e) {
    return undefined;
  }
}

function genReservationCode() {
  return 'FR' + Math.random().toString(36).slice(2, 8).toUpperCase();
}
function genETicket() {
  return '784-' + Math.floor(1000000000 + Math.random() * 8999999999).toString();
}

function formatMasked(cardNumber: string) {
  const last4 = cardNumber.slice(-4);
  return 'CARD •••• ' + last4;
}

export const useFanRushStore = defineStore('fanrush', {
  state: (): FanRushState =>
    loadFromStorage() ?? {
      rush: { isActive: false },
      booking: { status: 'NONE' },
      notifications: [],
      pastReservations: [],
    } as FanRushState,
  getters: {
    isLoggedIn: (s) => !!s.user,
    remainingMs: (s) => {
      if (!s.rush.isActive || !s.rush.endAt) return 0;
      const diff = new Date(s.rush.endAt).getTime() - Date.now();
      return Math.max(0, diff);
    },
    remainingHHMMSS(): string {
      const ms = (this as any).remainingMs as number;
      let sec = Math.floor(ms / 1000);
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      sec %= 3600;
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return `${h}:${m}:${s}`;
    },
  },
  actions: {
    login(provider: User['provider'], name: string) {
      this.user = { id: crypto.randomUUID(), name, provider };
      saveToStorage(this.$state);
    },
    logout() {
      delete this.user;
      this.booking = { status: 'NONE' };
      saveToStorage(this.$state);
    },
    saveProfile(p: Omit<RushProfile, 'paymentCardMasked'> & { paymentCardNumber?: string }) {
      const masked = p.paymentCardNumber ? formatMasked(p.paymentCardNumber) : this.profile?.paymentCardMasked;
      this.profile = {
        originAirport: p.originAirport,
        passportNameEn: p.passportNameEn,
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiry,
        preferredAirline: p.preferredAirline,
        seatClass: p.seatClass,
        paymentCardMasked: masked,
      } as RushProfile;
      saveToStorage(this.$state);
    },
    startRush(hours = 72) {
      const endAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      this.rush = { isActive: true, endAt };
      const notification: NotificationItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        title: 'Rush 시작!',
        body: '72시간의 기적이 시작됩니다. 지금 바로 예약을 완료하세요.'
      };
      this.notifications.unshift(notification);
      // auto create offer
      this.booking = { status: 'OFFERED', offer: this.generateOffer() };
      saveToStorage(this.$state);
    },
    cancelRush() {
      this.rush = { isActive: false };
      saveToStorage(this.$state);
    },
    generateOffer(): BookingOffer {
      const airline = this.profile?.preferredAirline || ['KE', 'OZ', 'MU', 'CZ'][Math.floor(Math.random() * 4)];
      const flightNumber = airline + String(Math.floor(100 + Math.random() * 899));
      const now = new Date();
      const depart = new Date(now.getTime() + 24 * 3600 * 1000);
      const arrive = new Date(depart.getTime() + (3 + Math.floor(Math.random() * 3)) * 3600 * 1000);
      const seatClass = this.profile?.seatClass || 'ECONOMY';
      const base = seatClass === 'BUSINESS' ? 1200000 : 450000;
      const surge = 1 + Math.random() * 0.6;
      return {
        airline,
        flightNumber,
        departTime: depart.toISOString(),
        arriveTime: arrive.toISOString(),
        seatClass,
        totalPrice: Math.round(base * surge),
        currency: 'KRW',
        highDemand: Math.random() > 0.6,
      } as BookingOffer;
    },
    refreshOffer() {
      if (this.booking.status === 'NONE') return;
      this.booking = { status: 'OFFERED', offer: this.generateOffer() };
      saveToStorage(this.$state);
    },
    confirmBooking() {
      if (this.booking.status !== 'OFFERED') return;
      const reservationCode = genReservationCode();
      this.booking = { status: 'CONFIRMED', offer: this.booking.offer, reservationCode };
      saveToStorage(this.$state);
    },
    completePayment() {
      if (this.booking.status !== 'CONFIRMED') return;
      const eTicketNumber = genETicket();
      const record = {
        reservationCode: this.booking.reservationCode,
        eTicketNumber,
        offer: this.booking.offer,
        bookedAt: new Date().toISOString(),
      };
      this.pastReservations.unshift(record);
      this.booking = { status: 'TICKETED', offer: this.booking.offer, reservationCode: this.booking.reservationCode, eTicketNumber };
      saveToStorage(this.$state);
    },
    resetAll() {
      this.$reset();
      saveToStorage(this.$state);
    },
    addNotification(n: NotificationItem) {
      this.notifications.unshift(n);
      saveToStorage(this.$state);
    }
  },
});
