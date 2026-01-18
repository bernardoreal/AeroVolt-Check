
export enum BatteryType {
  LI_ION = 'Íon-Lítio (Recarregável)',
  LI_METAL = 'Metal Lítio (Não Recarregável)',
  NI_MH = 'Níquel-Hidreto Metálico (Ni-MH)'
}

export enum Configuration {
  STANDALONE = 'Solta (Granel)',
  PACKED_WITH = 'Embalada com Equipamento',
  CONTAINED_IN = 'Contida em Equipamento'
}

export enum ComplianceStatus {
  ALLOWED = 'Permitido (Seção II)',
  RESTRICTED = 'Permitido c/ Restrições (Seção I)',
  FORBIDDEN_PAX = 'Proibido em PAX (Apenas CAO)',
  FORBIDDEN_ALL = 'Proibido (Forbidden)'
}

export type AirlineCode = 'L7' | 'FX' | 'EK' | 'IATA';

export interface BatterySpecs {
  airline: AirlineCode;
  type: BatteryType;
  config: Configuration;
  structure: 'cell' | 'battery'; 
  voltage: number;
  capacityAh: number; 
  packageCount: number;      // Quantidade de Volumes (Caixas)
  unitsPerPackage: number;   // Unidades (Baterias/Células) por Volume
  isConsolidated: boolean;   // Se os volumes estão em Overpack
  innerPackageHasLabel: boolean; // Indica se a embalagem interna possui etiqueta
  isDefective: boolean;      // SP A154 - Damaged/Defective
}

export interface CalculationResult {
  energy: number; // Wh for Ion, Grams for Metal
  unit: string; // "Wh" or "g"
  status: ComplianceStatus;
  labels: string[];
  instructions: string;
  packingInstruction: string;
  socRuleApply: boolean;
  alertColor: 'green' | 'yellow' | 'red';
  limitPerPackage?: string;
  reasoning?: string;
  packagingSpecs?: string[];
  unNumber: string;
  awbStatement?: string;
  documents: string[];
  calcDetails?: string;
  specialProvisions: string[];
  dgrSection?: string;
}

export interface FeedbackData {
  rating: 'positive' | 'negative';
  comment?: string;
  submittedAt?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  documentUrl?: string; // Optional field for documentation links
  feedback?: FeedbackData;
}
