export type ProductInfo = {
    id: number;
    name: string;
    description: string;
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    sku: string;
    slug: string;
    images: ProductImage[];
    gallery_images: { src: string }[];
    variation_id: number;
    date_created: string;
    categories: Category[];
    price_html: string;
    stock_status: string;
    meta_data?: MetaDataItem[];
    variations: Variation[]; // 🔄 Замість number[]
    attributes: {
        name: string;
        options: string[];
        slug: string;
        option: string;
    }[];
    featured: boolean;
    quantity: number;
    stock_quantity: number;
    average_rating: string;
    rating_count: string;
    type: string;
};

export interface MetaDataItem {
    id: number;
    key: string;
    value: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Variation {
    id: number;
    price: string;
    price_html: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    stock_quantity: number;
    stock_status: string;
    slug: string;
    sku: string;
    images: { src: string }[];
    attributes: {
        name: string;
        option: string;
    }[];
}





export interface ImageSize {
    file: string;
    width: number;
    height: number;
    "mime-type": string;
    filesize: number;
    source_url?: string; // якщо API повертає повний URL
}

export interface MediaDetails {
    width: number;
    height: number;
    file: string;
    filesize: number;
    sizes: {
        thumbnail?: ImageSize;
        medium?: ImageSize;
        large?: ImageSize;
        medium_large?: ImageSize;
        [key: string]: ImageSize | undefined; // для додаткових (1536x1536 тощо)
    };
}

export interface ProductImage {
    src: string;
    name?: string;
    alt?: string;
    id?: number;
    media_details?: MediaDetails;
}
