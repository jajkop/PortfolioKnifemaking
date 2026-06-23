export interface KnifeListItem {
  id: number;
  name: string;
  price: number;
  mainImageUrl: string | null;
  createdAt: string;
}

export interface KnifeImage {
  id: number;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface KnifeDetail {
  id: number;
  name: string;
  price: number;
  steel: string;
  handle: string;
  sheath: string;
  totalLength: number;
  workingLength: number;
  maxWidth: number;
  thickness: number;
  createdAt: string;
  images: KnifeImage[];
}

export interface KnifeFormData {
  name: string;
  price: number;
  steel: string;
  handle: string;
  sheath: string;
  totalLength: number;
  workingLength: number;
  maxWidth: number;
  thickness: number;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
}
