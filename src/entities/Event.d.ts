import { Organizer } from "./Organizer";
import { Tag } from "../services/tag";


export interface Event {
    id: number;
    organizer: number;
    name: string;
    descriptionShort: string;
    start: number | null;
    end: number | null;
    country: string;
    location: string;
    pricePool: string;
    banner: string;
    description: string;
    descriptionType: 'description' | 'information' | 'advice';
    disclaimer: string;
    isFeatured: boolean;
    isMainEvent: boolean;
}

export interface EventLink {
    id: number;
    event: number;
    linkType: 'homepage' | 'liquipedia' | 'custom';
    name: string;
    link: string;
}

export interface DecoratedEvent extends Omit<Event, 'organizer'> {
    organizer: Organizer;
    links: EventLink[];
    tags: Tag[];
}