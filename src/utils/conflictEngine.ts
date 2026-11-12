import { Equipment, Reservation, Shift } from '../types';

/**
 * Returns standard default start/end times for school shifts
 */
export function getDefaultShiftTimes(shift: Shift): { startTime: string; endTime: string } {
  switch (shift) {
    case 'Manhã':
      return { startTime: '07:30', endTime: '11:45' };
    case 'Tarde':
      return { startTime: '13:15', endTime: '17:30' };
    case 'Noite':
      return { startTime: '19:00', endTime: '22:30' };
    case 'Integral':
      return { startTime: '08:00', endTime: '16:30' };
    default:
      return { startTime: '07:30', endTime: '11:45' };
  }
}

/**
 * Parses time string "HH:MM" into minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Checks if two time windows [startA, endA) and [startB, endB) overlap
 */
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return sA < eB && eA > sB;
}

/**
 * Determines if a reservation status blocks new bookings
 */
export function isBlockingStatus(status: Reservation['status']): boolean {
  return status === 'approved' || status === 'pending' || status === 'picked_up' || status === 'in_use';
}

/**
 * Calculates how many units of an equipment are already booked in a specific window
 */
export function getBookedQuantityInWindow(
  reservations: Reservation[],
  equipmentId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeResId?: string | null
): number {
  return reservations.reduce((total, res) => {
    if (excludeResId && res.id === excludeResId) return total;
    if (res.equipmentId !== equipmentId || res.date !== date) return total;
    if (!isBlockingStatus(res.status)) return total;

    if (isTimeOverlapping(startTime, endTime, res.startTime, res.endTime)) {
      return total + (res.quantity || 1);
    }
    return total;
  }, 0);
}

/**
 * Checks if a requested reservation has a conflict (stock exhaustion or direct schedule collision)
 */
export function checkReservationConflict(
  reservations: Reservation[],
  equipment: Equipment,
  requestedQty: number,
  date: string,
  shift: Shift,
  startTime: string,
  endTime: string,
  excludeResId?: string | null
): { hasConflict: boolean; conflictReservation?: Reservation; remainingAvailable: number } {
  if (!equipment || !date) {
    return { hasConflict: false, remainingAvailable: equipment?.totalQuantity || 1 };
  }

  // Equipment in maintenance or inactive is completely unavailable
  if (equipment.status === 'maintenance' || equipment.status === 'inactive') {
    return { hasConflict: true, remainingAvailable: 0 };
  }

  const alreadyBooked = getBookedQuantityInWindow(
    reservations,
    equipment.id,
    date,
    startTime,
    endTime,
    excludeResId
  );

  const remaining = Math.max(0, equipment.totalQuantity - alreadyBooked);

  if (remaining < requestedQty) {
    // Find the first blocking reservation for details
    const conflictRes = reservations.find((r) => {
      if (excludeResId && r.id === excludeResId) return false;
      if (r.equipmentId !== equipment.id || r.date !== date) return false;
      if (!isBlockingStatus(r.status)) return false;
      return isTimeOverlapping(startTime, endTime, r.startTime, r.endTime);
    });

    return {
      hasConflict: true,
      conflictReservation: conflictRes,
      remainingAvailable: remaining
    };
  }

  return { hasConflict: false, remainingAvailable: remaining };
}

/**
 * Recommends alternative equipment if the desired one is busy or insufficient
 */
export function findAlternativeEquipment(
  equipments: Equipment[],
  reservations: Reservation[],
  currentEquipId: string,
  requestedQty: number,
  date: string,
  shift: Shift,
  startTime: string,
  endTime: string
): Equipment | null {
  const currentEquip = equipments.find((e) => e.id === currentEquipId);
  if (!currentEquip) return null;

  // Search within same category first, then within same resourceType
  const sameCategoryCandidates = equipments.filter(
    (e) =>
      e.id !== currentEquipId &&
      e.category === currentEquip.category &&
      e.status === 'available'
  );

  for (const candidate of sameCategoryCandidates) {
    const { hasConflict } = checkReservationConflict(
      reservations,
      candidate,
      requestedQty,
      date,
      shift,
      startTime,
      endTime
    );
    if (!hasConflict) return candidate;
  }

  // Try same resourceType if not found
  const sameTypeCandidates = equipments.filter(
    (e) =>
      e.id !== currentEquipId &&
      e.resourceType === currentEquip.resourceType &&
      e.status === 'available' &&
      !sameCategoryCandidates.includes(e)
  );

  for (const candidate of sameTypeCandidates) {
    const { hasConflict } = checkReservationConflict(
      reservations,
      candidate,
      requestedQty,
      date,
      shift,
      startTime,
      endTime
    );
    if (!hasConflict) return candidate;
  }

  return null;
}

/**
 * Formats ISO date YYYY-MM-DD to Brazilian standard DD/MM/YYYY
 */
export function formatDateBr(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
