export type CategoryInfo = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    count: number;
    parent: number;
    lang: string;
    custom_category_image: {
        id: number;
        src: string;
        alt?: string;
    } | null;
    translations?: {
        [langCode: string]: string | number;
    };
    image: {
        id: number;
        src: string;
        alt?: string;
    } | null;
};
