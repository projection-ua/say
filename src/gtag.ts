export function gtagEvent(action: string, params: any): void {
    window.gtag && window.gtag('event', action, params);
}
