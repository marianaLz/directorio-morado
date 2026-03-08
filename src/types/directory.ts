export type SupportType =
  | 'abortion accompaniment'
  | 'psychological support'
  | 'legal support'
  | 'community support'
  | 'sexual violence support'
  | 'reproductive rights'
  | 'sexual health'
  | 'financial support'
  | 'government services'
  | 'crisis hotline'
  | 'nutrition support'
  | 'medical and health'
  | 'associations and foundations';

export type PopulationType =
  | 'women'
  | 'girls'
  | 'survivors of sexual violence'
  | 'men survivors'
  | 'general public';

export type CostType = 'free' | 'low cost' | 'variable' | 'consult directly';

export interface DirectoryEntry {
  id: string;
  name: string;
  instagram?: string;
  website?: string;
  phone?: string;
  location: string;
  country: string;
  state: string;
  city: string;
  type: SupportType[];
  cost: CostType;
  population: PopulationType[];
  online: boolean;
  description: string;
  whatsapp?: string;
  hours?: string;
  isEmergency?: boolean;
}
