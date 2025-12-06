export interface SectorSummaryResponse {
  sectorTotals: Record<string, number>;
  filterCountry?: string | null;
  filterContinent?: string | null;
  gas: string;
  year: number;
}

export interface SubsectorSummaryResponse {
  sector: string;
  subsectorTotals: Record<string, number>;
  filterCountry?: string | null;
  filterContinent?: string | null;
  gas: string;
  year: number;
}

export interface CountrySummaryResponse {
  countryTotals: Record<string, number>;
  filterSector?: string | null;
  filterContinent?: string | null;
  gas: string;
  year: number;
}

export interface ContinentSummaryResponse {
  continentTotals: Record<string, number>;
  filterSector?: string | null;
  gas: string;
  year: number;
}

export interface EmissionSource {
  id: number;
  name: string;
  sector: string;
  subsector: string;
  country: string;
  assetType: string;
  sourceType: string;
  gas: string;
  emissionsQuantity: number;
  year: number;
}

export interface SourcesResponse {
  sources: EmissionSource[];
  filterCountry?: string | null;
  filterContinent?: string | null;
  filterSector?: string | null;
  filterSubsector?: string | null;
  gas: string;
  year: number;
}

export const GASES = [
  { label: 'CO₂ Equivalent (100yr)', value: 'co2e_100yr' },
  { label: 'CO₂ Equivalent (20yr)', value: 'co2e_20yr' },
  { label: 'Carbon Dioxide (CO₂)', value: 'co2' },
  { label: 'Methane (CH₄)', value: 'ch4' },
  { label: 'Nitrous Oxide (N₂O)', value: 'n2o' },
];
