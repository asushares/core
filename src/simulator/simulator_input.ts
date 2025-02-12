// Author: Preston Lee

import { ConsentCategorySettings } from "@asushares/core";
import { Bundle, Consent } from "fhir/r5";

export class SimulatorInput {

public consent: Consent | undefined;
public bundle: Bundle | undefined;
public categorySettings: ConsentCategorySettings = new ConsentCategorySettings();

public engineOptions = {};

}