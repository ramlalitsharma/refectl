export type ModuleHealth = {
  module: string;
  ok: boolean;
  timestamp: string;
  details?: string;
};

export abstract class FeatureModule {
  protected readonly moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  async healthCheck(): Promise<ModuleHealth> {
    return {
      module: this.moduleName,
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }
}

