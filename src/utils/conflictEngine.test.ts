import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTimeOverlapping,
  timeToMinutes,
  checkReservationConflict,
  findAlternativeEquipment,
  getDefaultShiftTimes
} from './conflictEngine';
import { Equipment, Reservation } from '../types';

const MOCK_EQUIPMENTS: Equipment[] = [
  {
    id: 'cb-01',
    patrimonyNumber: 'PAT-2024-001',
    name: 'Carrinho de Chromebooks 01',
    resourceType: 'tecnologico',
    category: 'chromebooks',
    categoryLabel: 'Chromebooks',
    specs: '36 Chromebooks Lenovo',
    tag: 'Prédio A',
    location: 'Depósito T.I.',
    condition: 'Excelente',
    status: 'available',
    totalQuantity: 1,
    availableQuantity: 1
  },
  {
    id: 'cb-02',
    patrimonyNumber: 'PAT-2024-002',
    name: 'Carrinho de Chromebooks 02',
    resourceType: 'tecnologico',
    category: 'chromebooks',
    categoryLabel: 'Chromebooks',
    specs: '36 Chromebooks Dell',
    tag: 'Prédio B',
    location: 'Depósito T.I.',
    condition: 'Excelente',
    status: 'available',
    totalQuantity: 1,
    availableQuantity: 1
  },
  {
    id: 'mic-01',
    patrimonyNumber: 'PAT-2024-050',
    name: 'Microscópios Ópticos Biológicos',
    resourceType: 'pedagogico',
    category: 'ciencias_biologia',
    categoryLabel: 'Ciências e Biologia',
    specs: 'Aumento 1000x',
    tag: 'Lab Ciências',
    location: 'Laboratório de Ciências',
    condition: 'Bom',
    status: 'available',
    totalQuantity: 15,
    availableQuantity: 15
  }
];

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-1001',
    equipmentId: 'cb-01',
    equipmentName: 'Carrinho de Chromebooks 01',
    resourceType: 'tecnologico',
    category: 'chromebooks',
    patrimonyNumber: 'PAT-2024-001',
    quantity: 1,
    date: '2026-10-26',
    shift: 'Manhã',
    startTime: '08:00',
    endTime: '11:30',
    room: 'Sala 101',
    professor: 'Prof. Silva',
    functionalId: 'FUNC-101',
    subject: 'Matemática',
    turma: '9º Ano A',
    pedagogicalPurpose: 'Khan Academy',
    status: 'approved',
    createdAt: 'Hoje'
  },
  {
    id: 'RES-1002',
    equipmentId: 'mic-01',
    equipmentName: 'Microscópios Ópticos Biológicos',
    resourceType: 'pedagogico',
    category: 'ciencias_biologia',
    patrimonyNumber: 'PAT-2024-050',
    quantity: 10,
    date: '2026-10-26',
    shift: 'Tarde',
    startTime: '13:30',
    endTime: '15:30',
    room: 'Lab Ciências',
    professor: 'Profa. Débora',
    functionalId: 'FUNC-102',
    subject: 'Ciências',
    turma: '7º Ano B',
    pedagogicalPurpose: 'Observação de células vegetais',
    status: 'approved',
    createdAt: 'Hoje'
  }
];

test('timeToMinutes correctly converts HH:MM', () => {
  assert.equal(timeToMinutes('07:30'), 450);
  assert.equal(timeToMinutes('13:15'), 795);
});

test('isTimeOverlapping detects colliding windows', () => {
  assert.equal(isTimeOverlapping('08:00', '11:00', '09:00', '12:00'), true);
  assert.equal(isTimeOverlapping('08:00', '10:00', '10:00', '12:00'), false);
});

test('checkReservationConflict detects single item conflict', () => {
  const result = checkReservationConflict(
    MOCK_RESERVATIONS,
    MOCK_EQUIPMENTS[0],
    1,
    '2026-10-26',
    'Manhã',
    '08:00',
    '11:00'
  );
  assert.equal(result.hasConflict, true);
  assert.equal(result.remainingAvailable, 0);
  assert.equal(result.conflictReservation?.id, 'RES-1001');
});

test('checkReservationConflict allows booking within multi-unit inventory', () => {
  // mic-01 has 15 total, 10 booked, 5 remaining
  const canBook4 = checkReservationConflict(
    MOCK_RESERVATIONS,
    MOCK_EQUIPMENTS[2],
    4,
    '2026-10-26',
    'Tarde',
    '14:00',
    '15:00'
  );
  assert.equal(canBook4.hasConflict, false);
  assert.equal(canBook4.remainingAvailable, 5);

  // Requesting 6 when only 5 remaining should flag conflict
  const cannotBook6 = checkReservationConflict(
    MOCK_RESERVATIONS,
    MOCK_EQUIPMENTS[2],
    6,
    '2026-10-26',
    'Tarde',
    '14:00',
    '15:00'
  );
  assert.equal(cannotBook6.hasConflict, true);
});

test('findAlternativeEquipment proposes available equivalent resource', () => {
  const alt = findAlternativeEquipment(
    MOCK_EQUIPMENTS,
    MOCK_RESERVATIONS,
    'cb-01',
    1,
    '2026-10-26',
    'Manhã',
    '08:00',
    '11:00'
  );
  assert.notEqual(alt, null);
  assert.equal(alt?.id, 'cb-02');
});
