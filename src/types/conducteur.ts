
import { Campagne } from './api';

export interface Conducteur {
    id: number;
    name: string;
    date: string;
    status: 'draft' | 'published';
    slots: ConducteurSlot[];
    created_at: string;
    updated_at?: string;
}

export interface ConducteurSlot {
    id?: number;
    conducteur_id?: number;
    time_slot: string;
    campagne_id: number | null;
    campagne?: Campagne;
}

export interface CreateConducteurRequest {
    name: string;
    date: string;
    status: 'draft' | 'published';
    slots: {
        time_slot: string;
        campagne_id: number | null;
    }[];
}

export interface UpdateConducteurRequest {
    name?: string;
    date?: string;
    status?: 'draft' | 'published';
    slots?: {
        time_slot: string;
        campagne_id: number | null;
    }[];
}
