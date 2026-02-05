// API Response Types
export interface Client {
    id: number;
    name: string;
    email: string;
    campagne_nom: string;
    adresse: string;
    telephone: string;
    created_at?: string;
    updated_at?: string;
}

export interface Categorie {
    id: number;
    nom_categorie: string;
    created_at?: string;
    updated_at?: string;
}

export interface Campagne {
    id: number;
    date_debut: string;
    date_fin: string;
    type: 'classique' | 'hor_écran';
    ranking: number;
    spot: number;
    spot_id?: number;
    duree?: number;
    id_client: number;
    id_categorie: number;
    created_at?: string;
    updated_at?: string;
    client?: Client;
    categorie?: Categorie;
}

export interface Conducteur {
    id: number;
    heures: string;
    campagnes: string;
    spots: string;
    duree: number;
    numero: string;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
}

// API Request Types
export interface CreateClientRequest {
    name: string;
    email: string;
    campagne_nom: string;
    adresse: string;
    telephone: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> { }

export interface CreateCampagneRequest {
    date_début: string;
    date_fin: string;
    type: 'classique' | 'hor_écran';
    ranking: number;
    duree: number;
    spot: string;
    spot_id?: number;
    id_client: number;
    id_categorie: number;
}

export interface UpdateCampagneRequest extends Partial<CreateCampagneRequest> { }

export interface CreateCategorieRequest {
    nom_categorie: string;
}

export interface UpdateCategorieRequest extends Partial<CreateCategorieRequest> { }

export interface CreateConducteurRequest {
    heures: string;
    campagnes: string;
    spots: string;
    duree: number;
    numero: string;
}

export interface UpdateConducteurRequest extends Partial<CreateConducteurRequest> { }

// Query Parameters
export interface CampagneQueryParams {
    search?: string;
    categorie_id?: number;
    type?: 'classique' | 'hor_écran';
    ranking?: number;
}
