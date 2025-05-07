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
    attribute_color: AttributeOption[];
    stock_status: string;
    meta_data?: MetaDataItem[];
    variations: Variation[]; // 🔄 Замість number[]
    attributes: {
        name: string;
        slug: string;
        options: AttributeOption[];
    }[];
    featured: boolean;
    quantity: number;
    stock_quantity: number;
    average_rating: string;
    rating_count: string;
    type: string;
    colorName: string;
    hiddenInCatalog: boolean;
};


export interface AttributeOption {
    name: string;
    slug: string;
    id_variations: AttributeColorVariation;
}

export interface AttributeColorVariation {
    variation_id?: number;
    variation_atribute_color?: string;
    variation_slug?: string;
}


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
    url: string; // ✅ назва поля як у API
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
        "1536x1536"?: ImageSize;
        "2048x2048"?: ImageSize;
        woocommerce_thumbnail?: ImageSize;
        woocommerce_single?: ImageSize;
        woocommerce_gallery_thumbnail?: ImageSize;
        [key: string]: ImageSize | undefined; // на випадок додаткових
    };
}


export interface ProductImage {
    src: string;
    name?: string;
    alt?: string;
    id?: number;
    media_details?: MediaDetails;
}
