export interface NpLocation {
    name: string;
    ref: string;
    warehouses: {
        name: string;
        position: {
            latitude: string;
            longitude: string;
        };
        maxWeightPlaceSender: number;
        maxWeightPlaceRecipient: number;
        workSchedule: string;
    }[];
    streets: string[];
}
