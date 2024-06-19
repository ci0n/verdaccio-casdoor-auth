import { Config } from "@verdaccio/types";
import { SDK } from "casdoor-nodejs-sdk";



export type CasdoorConfig = ConstructorParameters<typeof SDK>[0];


export interface PluginConfig extends CasdoorConfig, Config {}
