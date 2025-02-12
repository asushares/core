// Author: Preston Lee

import { SimulatorInput } from "./simulator_input";

export abstract class AbstractSimulator {

    constructor(public input: SimulatorInput){
    }
    
    abstract simulate(): Promise<void>;

}