// lib/types.ts

export type User = {
    id: string;
    slug: string;
    displayName: string;
    role: string;
    domain: string;
    location: string;
    email: string;
    claim: string;
    proofUrl: string;
    foundingNumber?: number;
    createdAt?: string;
};

export type Cheer = {
    id: string;
    toSlug: string;
    fromSlug?: string;
    createdAt?: string;
};
