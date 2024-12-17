// Author: Preston Lee

export class InformationCategorySetting {

    public enabled: boolean = true;
    public act_code: string;
    public system: string = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
    public name: string;
    public description: string;

    constructor(act_code: string, name: string, description: string) {
        this.act_code = act_code;
        this.name = name;
        this.description = description;
    }

}