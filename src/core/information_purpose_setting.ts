// Author: Preston Lee

export class InformationPurposeSetting {

    public enabled: boolean = false;
    public act_code: string;
    public system: string = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
    public description: string;

    constructor(act_code: string = '', description: string = '') {
        this.act_code = act_code;
        this.description = description;
    }

}