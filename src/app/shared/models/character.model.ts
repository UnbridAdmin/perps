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
