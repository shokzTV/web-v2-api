import { Organizer } from "./Organizer";
import { Tag } from "../services/tag";

export type EventDescriptionType = 'description' | 'information' | 'advice';
export type EventLinkType = 'homepage' | 'liquipedia' | 'custom';

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
    descriptionType: EventDescriptionType;
    disclaimer: string;
    isFeatured: boolean;
    isMainEvent: boolean;
}

export interface EventLink {
    id: number;
    event: number;
    linkType: EventLinkType;
    name: string;
    link: string;
}

export interface DecoratedEvent extends Omit<Event, 'organizer'> {
    organizer: Organizer;
    links: EventLink[];
    tags: Tag[];
}