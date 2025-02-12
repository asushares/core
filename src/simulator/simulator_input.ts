// Author: Preston Lee

import { Bundle, Consent } from "fhir/r5";
import { ConsentCategorySettings } from "../core/consent_category_settings";

export class SimulatorInput {

public consent: Consent | undefined;
public bundle: Bundle | undefined;
public categorySettings: ConsentCategorySettings = new ConsentCategorySettings();

public engineOptions = {};

}