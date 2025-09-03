// Author: Preston Lee

import { Consent, ConsentProvision } from 'fhir/r5.js';
import { v4 as uuidv4 } from 'uuid';
import { InformationCategorySetting } from './information_category_setting.js';

export class ConsentTemplate {


  static templateConsent() {
    let c: Consent = {
      resourceType: 'Consent',
      status: 'active',
      decision: 'permit',
      category: [
        {
          id: uuidv4(),
          text: 'Privacy Consent',
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/consentscope",
              "code": "patient-privacy",
              "display": "Privacy Consent"
            }
          ]
        },
        {
          id: uuidv4(),
          text: 'LOINC Consent Document',
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "59284-6",
              "display": 'Consent Document'
            }
          ]
        }
      ],
      // grantor: [],
      controller: [],
      provision: [ConsentTemplate.templateProvision()]
    };
    return c;
  }


  static templateProvision(): ConsentProvision {
    let cp = {
      id: uuidv4(),
      actor: [{
        reference: {
          reference: ''
        },
        role: {
          coding: [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "IRCP"
            }
          ]
        }
      }],
      action: [{
        coding: [
          {
            "system": "http://terminology.hl7.org/CodeSystem/consentaction",
            "code": "access"
          }
        ]
      }],
      // securityLabel: [],
      purpose: [
        {
          "system": InformationCategorySetting.ACT_CODE_SYSTEM,
          "code": InformationCategorySetting.ACT_CODE_RESEARCH_CODE,
          "display": InformationCategorySetting.ACT_CODE_RESEARCH_DISPLAY
        },
        {
          "system": InformationCategorySetting.ACT_CODE_SYSTEM,
          "code": InformationCategorySetting.ACT_CODE_TREATMENT_CODE,
          "display": InformationCategorySetting.ACT_CODE_TREATMENT_DISPLAY
        }
      ]
    }
    // let s = new ConsentCategorySettings();
    // s.updateConsentProvision(cp);
    return cp;
  }

}