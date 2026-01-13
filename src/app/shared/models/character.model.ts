export interface Character {
  id: string;
  name: string;
  multiplier: number;
  price?: {
    usd: number;
    ton?: number;
  };
  image: string;
  selectImage: string;
  gifImage: string;
  unlocked: boolean;
  dailyBase?: number;
  monthLimit?: number;
  treeRequirement?: {
    treeTypeId: string;
    treeName: string;
  };
}

export interface ProjectPhase {
  id: number;
  name: string;
  roiMultiplier: number; // 1.5, 1.3, 1.2, 1.1, 1.05
  tokenPrice: number;
  isCurrentPhase: boolean;
  packageData: {
    [multiplier: number]: {
      cost: number;
      monthlyTokens: number;
    };
  };
}
