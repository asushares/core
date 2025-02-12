// Author: Preston Lee

export class InformationCategorySetting {

    public static ACT_CODE_SYSTEM = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
    public static ACT_CODE_TREATMENT_CODE = 'HIPAAConsentCD';
    public static ACT_CODE_TREATMENT_NAME = 'Treatment';
    public static ACT_CODE_TREATMENT_DISPLAY = 'For the purposes of providing or supporting care.';
    public static ACT_CODE_RESEARCH_CODE = 'RESEARCH'
    public static ACT_CODE_RESEARCH_NAME = 'Research';
    public static ACT_CODE_RESEARCH_DISPLAY = 'Scientific and academic research intended to benefit others.';

    // public static ACT_REASON_SYSTEM = 'http://terminology.hl7.org/CodeSystem/v3-ActReason';
    // public static ACT_REASON_42CFRPART2_CODE = '42CFRPart2';
    // public static ACT_REASON_42CFRPART2_DISPLAY = '42 CFR Part2';
    // public static ACT_REASON_RESEARCH_CODE = 'RESCH'
    // public static ACT_REASON_RESEARCH_DISPLAY = 'Research Purposes';

    public enabled: boolean = true;
    public act_code: string;
    public system: string = InformationCategorySetting.ACT_CODE_SYSTEM;
    public name: string;
    public description: string;

    constructor(act_code: string, name: string, description: string) {
        this.act_code = act_code;
        this.name = name;
        this.description = description;
    }

}