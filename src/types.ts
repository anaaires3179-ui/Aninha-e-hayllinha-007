export type ResourceType = 'tecnologico' | 'pedagogico';

export type EquipmentCategory =
  // Tecnológicos
  | 'datashow'
  | 'chromebooks'
  | 'notebooks'
  | 'computadores'
  | 'tablets'
  | 'tvs'
  | 'lousas_interativas'
  | 'audio'
  | 'microfones'
  | 'cameras'
  | 'cabos_conectividade'
  | 'acessorios_apoio'
  // Pedagógicos
  | 'matematica'
  | 'ciencias_biologia'
  | 'geografia_historia'
  | 'lingua_portuguesa'
  | 'artes_ed_fisica'
  | 'inclusao_acessibilidade';

export type Shift = 'Manhã' | 'Tarde' | 'Noite' | 'Integral';

export type ItemCondition = 'Novo' | 'Excelente' | 'Bom' | 'Regular' | 'Em Reparo';

export type EquipmentStatus = 'available' | 'reserved' | 'in_use' | 'maintenance' | 'inactive';

export interface Equipment {
  id: string;
  patrimonyNumber: string; // Ex: PAT-2024-0012
  name: string;
  resourceType: ResourceType;
  category: EquipmentCategory;
  categoryLabel: string;
  specs: string;
  tag: string; // Ex: Prédio A, Maleta 02
  location: string; // Ex: Depósito T.I., Sala de Recursos, Almoxarifado
  condition: ItemCondition;
  status: EquipmentStatus;
  totalQuantity: number;
  availableQuantity: number;
  instructions?: string;
  serialNumber?: string;
  accessoriesIncluded?: string[];
  isKit?: boolean;
  kitItems?: string[];
  imageUrl?: string;
}

export type ReservationStatus = 
  | 'pending'     // Aguardando aprovação da coordenação/almoxarifado
  | 'approved'    // Aprovado
  | 'rejected'    // Recusado
  | 'picked_up'   // Retirado pelo professor
  | 'in_use'      // Em utilização
  | 'returned'    // Devolvido com sucesso
  | 'cancelled';  // Cancelado pelo solicitante

export type BookingModalType = 
  | 'individual' 
  | 'category' 
  | 'datetime' 
  | 'turma' 
  | 'room' 
  | 'recurrent' 
  | 'kit';

export interface Reservation {
  id: string;
  equipmentId: string;
  equipmentName: string;
  resourceType: ResourceType;
  category: EquipmentCategory;
  patrimonyNumber: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  endDate?: string; // Para agendamento recorrente
  isRecurrent?: boolean;
  recurrentDays?: string[]; // Ex: ['Terça', 'Quinta']
  shift: Shift;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  professor: string;
  functionalId: string; // Matrícula funcional
  subject: string; // Disciplina
  turma: string; // Turma (ex: 9º Ano B, 3º Ano EM)
  pedagogicalPurpose: string; // Finalidade pedagógica
  neededAccessories?: string[];
  notes?: string;
  status: ReservationStatus;
  createdAt: string;
  rejectionReason?: string;
  cancellationReason?: string;
  pickedUpAt?: string;
  returnedAt?: string;
  damagedReported?: string;
}

export interface KitPreset {
  id: string;
  title: string;
  description: string;
  category: string;
  items: string[];
  targetAudience: string;
  defaultDurationHours: number;
}

export type UserRole = 'professor' | 'coordenador' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  functionalId: string;
  email: string;
  department: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  createdAt: string;
  read: boolean;
  actionReservationId?: string;
}

export interface BotMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  toolCall?: {
    name: 'consultar_disponibilidade' | 'criar_agendamento' | 'sugerir_alternativas';
    params: Record<string, any>;
    status: 'success' | 'warning' | 'error';
  };
}
