// Author: Preston Lee

import { Coding, ConsentProvision } from "fhir/r5";
import { InformationCategorySetting } from "./information_category_setting";
import { InformationPurposeSetting } from "./information_purpose_setting";

export class ConsentCategorySettings {

    // SHARES information categories
    substanceUse: InformationCategorySetting = new InformationCategorySetting('SUD', 'Records possibly pertaining to commonly abused stantances.');
    mentalHealth: InformationCategorySetting = new InformationCategorySetting('MENCAT', 'All manner of mental health and wellbeing information.');
    demographics: InformationCategorySetting = new InformationCategorySetting('DEMO', 'General ethnic, social, and environmental background.');
    diagnoses: InformationCategorySetting = new InformationCategorySetting('DIA', 'Medically recognized conditions you have experienced.');
    disabilities: InformationCategorySetting = new InformationCategorySetting('DIS', 'Physical or mental conditions limiting movement, sense, or activity.');
    genetics: InformationCategorySetting = new InformationCategorySetting('GDIS', 'Genomic and molecular data that may indicate, for example, susceptability to heritable disease');
    infectiousDiseases: InformationCategorySetting = new InformationCategorySetting('DISEASE', 'Past or present transmissible ailments.');
    medications: InformationCategorySetting = new InformationCategorySetting('DRGIS', 'Drugs prescribed to you.');
    sexualAndReproductive: InformationCategorySetting = new InformationCategorySetting('SEX', 'Information related to sexuality and reproductive health.');
    socialDeterminants: InformationCategorySetting = new InformationCategorySetting('SOCIAL', 'Environmental and contextual factors that may impact your health.');
    violence: InformationCategorySetting = new InformationCategorySetting('VIO', 'Indicators of possible physical or mental harm by violence.');

    // SHARES information sharing purposes
    treatment: InformationCategorySetting = new InformationCategorySetting('HIPAAConsentCD', 'For the purposes of providing or supporing care.');
    research: InformationCategorySetting = new InformationCategorySetting('RESEARCH', 'Scientific and academic research intended to benefit others.');


    allCategories(): InformationCategorySetting[] {
        return [
            this.substanceUse,
            this.mentalHealth,
            this.demographics,
            this.diagnoses,
            this.disabilities,
            this.genetics,
            this.infectiousDiseases,
            this.medications,
            this.sexualAndReproductive,
            this.socialDeterminants,
            this.violence];
    }

    allPurposes(): InformationPurposeSetting[] {
        return [
            this.treatment,
            this.research
        ];
    }

    applyCategoryCodings(codings: Coding[]) {
        codings.forEach(c => {
            this.applyCategoryCoding(c);
        });
    }

    applyCategoryCoding(coding: Coding) {
        this.allCategories().forEach(c => {
            if (c.act_code == coding.code) {
                c.enabled = true;
            }
        });
    }


    applyPurposeCodings(codings: Coding[]) {
        codings.forEach(c => {
            this.applyPurposeCoding(c);
        });
    }

    applyPurposeCoding(coding: Coding) {
        this.allPurposes().forEach(c => {
            if (c.act_code == coding.code) {
                c.enabled = true;
            }
        });
    }

    updateConsentProvisionCategory(provision: ConsentProvision, category: InformationCategorySetting) {
        if (category.enabled) {
            let found = false;
            provision?.securityLabel!.forEach(sl => {
                if (category.act_code == sl.code) {
                    found = true;
                }
            });
            if (!found) {
                console.log("ENABLING PURPOSE: " + category.act_code);
                provision?.securityLabel!.push({ code: category.act_code, system: category.system, display: category.description });
            }
        } else { // disabled
            let foundAt = -1;
            for (let i = 0; i < provision!.securityLabel!.length; i++) {
                if (category.act_code == provision!.securityLabel![i].code) {
                    foundAt = i;
                }
                if (foundAt >= 0) {
                    console.log("DISABLING PURPOSE: " + category.act_code);
                    provision?.securityLabel?.splice(foundAt, 1);
                }
            }
        }
    }

    updateConsentProvisionPurpose(provision: ConsentProvision, category: InformationPurposeSetting) {
        if (category.enabled) {
            let found = false;
            provision?.purpose!.forEach(pur => {
                if (category.act_code == pur.code) {
                    found = true;
                }
            });
            if (!found) {
                console.log("ENABLING PURPOSE: " + category.act_code);
                provision?.purpose?.push({ code: category.act_code, system: category.system, display: category.description });
            }
        } else { // disabled
            let foundAt = -1;
            for (let i = 0; i < provision!.purpose!.length; i++) {
                if (category.act_code == provision!.purpose![i].code) {
                    foundAt = i;
                }
                if (foundAt >= 0) {
                    console.log("DISABLING PURPOSE: " + category.act_code);
                    provision?.purpose?.splice(foundAt, 1);
                }
            }
        }
    }

    loadFromConsentProvision(provision: ConsentProvision) {
        if (!provision.securityLabel) {
            provision.securityLabel = [];
        }
        this.allCategories().forEach(c => {
            c.enabled = false;
        });
        this.applyCategoryCodings(provision.securityLabel);
        if (!provision.purpose) {
            provision.purpose = [];
        }
        this.allPurposes().forEach(c => {
            c.enabled = false;
        });
        this.applyPurposeCodings(provision.purpose);
    }

    updateConsentProvision(provision: ConsentProvision) {
        provision.securityLabel = [];
        provision.purpose = [];
        this.allCategories().forEach(c => {
            this.updateConsentProvisionCategory(provision, c);
        });

        this.allPurposes().forEach(c => {
            this.updateConsentProvisionPurpose(provision, c);
        });
    }
}