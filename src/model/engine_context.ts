// Author: Preston Lee

import { Bundle } from "fhir/r5";
import { SystemValue, SystemCode } from "../cds/data_sharing_cds_hook_request";

export class DataSharingEngineContext {
    /**
     * identifiers of the actor
     */
    actor: SystemValue[] = [];
    /**
     * purpose of use
     */
    purposeOfUse?: string[] | string = [];
    /**
     * categories of applicable consents to the workflow context
     */
    category?: SystemCode[] = [];
    /**
     * identity of the patient whose consent is being considered
     */
    patientId: SystemValue[] = [];
    /**
     * content classes being requested
     */
    class?: SystemCode[] = [];
    /**
     * content being requested
     */
    // content?: {
    //     entry: {
    //         resource: {
    //             resourceType: string;
    //             [k: string]: unknown;
    //         };
    //         [k: string]: unknown;
    //     }[];
    //     resourceType: string;
    //     [k: string]: unknown;
    // };
    content?: Bundle;
} 