export type CategoryInfo = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    count: number;
    parent: number;
    lang: string;
    translations?: {
        [langCode: string]: string | number;
    };
    image: {
        id: number;
        src: string;
        alt?: string;
    } | null;
};
