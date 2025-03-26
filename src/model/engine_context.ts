// Author: Preston Lee

import { Bundle } from "fhir/r5";
import { SystemValue, SystemCode } from "../cds/data_sharing_cds_hook_request";

export class DataSharingEngineContext {

    public static HEADER_CDS_REDACTION_ENABLED = 'CDS-Redaction-Enabled';
    public static HEADER_CDS_CREATE_AUDIT_EVENT_ENABLED = 'CDS-Create-Audit-Event';
    public static HEADER_CDS_CONFIDENCE_THRESHOLD = 'CDS-Confidence-Threshold';
    public static HEADER_CDS_RULES_FILE = 'CDS-Rules-File';

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
    content?: Bundle;
} 