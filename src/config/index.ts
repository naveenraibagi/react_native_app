import appEnv from '../../app-env.json';
import { APPS, AppConfig } from './apps';

export const ACTIVE_APP_ID = appEnv.activeAppId as keyof typeof APPS;

export const getActiveConfig = (): AppConfig => {
    return APPS[ACTIVE_APP_ID];
};

export const activeConfig = getActiveConfig();
