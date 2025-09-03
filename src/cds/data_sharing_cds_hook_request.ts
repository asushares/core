// Author: Preston Lee

import { v4 as uuidv4 } from 'uuid';
import { DataSharingEngineContext } from '../model/engine_context.js';


export class DataSharingCDSHookRequest {
    hook: string = "patient-consent-consult";
    /**
     * UUID for this hook call
     */
    hookInstance: string = uuidv4();
    /**
     * Context where the consent decision is needed
     */
    context: DataSharingEngineContext = new DataSharingEngineContext();
    [k: string]: unknown;
}

export interface SystemValue {
    system?: string;
    value: string;
}
export interface SystemCode {
    system: string;
    code: string;
}