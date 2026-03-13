export interface AppConfig {
    id: string;
    name: string;
    slug: string;
    version: string;
    packageName: string;
    bundleIdentifier: string;
    instagramHandle: string;
    youtubeUrl?: string;
    facebookUrl?: string;
    support?: {
        whatsapp: string[];
        phone: string[];
        email: string;
    };
    api: {
        baseUrl: string;
        consumerKey: string;
        consumerSecret: string;
    };
    assets: {
        icon: string;
        splash: string;
        favicon: string;
        adaptiveIconForeground: string;
        adaptiveIconBackground: string;
        splashBackgroundColor: string;
    };
    eas: {
        projectId: string;
    };
}

export declare const APPS: Record<string, AppConfig>;
