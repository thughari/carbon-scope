import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  SectorSummaryResponse,
  SubsectorSummaryResponse,
  CountrySummaryResponse,
  ContinentSummaryResponse,
  SourcesResponse,
  EmissionsOverviewResponse,
  SourcesInfoResponse,
} from '../models/emissions.models';
import {
  CountryElectricityProfile,
  DecarbonizationScenarioRequest,
  DecarbonizationScenarioResponse,
} from '../models/simulator.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

import {
  InterventionEvidence,
  CountryNdcProfile,
  ScenarioNdcComparison,
  PolicyComparisonResponse
} from '../models/policy.models';

@Injectable({ providedIn: 'root' })
export class EmissionsService {
  private readonly baseUrl = `${environment.apiUrl}/api/emissions`;
  private readonly simulatorUrl = `${environment.apiUrl}/api/simulator`;
  private readonly policyUrl = `${environment.apiUrl}/api/policy`;

  private activeScenarioSubject = new BehaviorSubject<DecarbonizationScenarioResponse | null>(null);
  readonly activeScenario$ = this.activeScenarioSubject.asObservable();

  setActiveScenario(scenario: DecarbonizationScenarioResponse | null) {
    this.activeScenarioSubject.next(scenario);
  }

  getActiveScenario(): DecarbonizationScenarioResponse | null {
    return this.activeScenarioSubject.getValue();
  }

  constructor(private http: HttpClient) {}

  getSimulatorCountries(): Observable<CountryElectricityProfile[]> {
    return this.http.get<CountryElectricityProfile[]>(`${this.simulatorUrl}/countries`);
  }

  getSimulatorCountryBaseline(countryCode: string): Observable<CountryElectricityProfile> {
    return this.http.get<CountryElectricityProfile>(`${this.simulatorUrl}/baseline/${countryCode}`);
  }

  calculateDecarbonizationScenario(request: DecarbonizationScenarioRequest): Observable<DecarbonizationScenarioResponse> {
    return this.http.post<DecarbonizationScenarioResponse>(`${this.simulatorUrl}/calculate`, request);
  }

  // --- Phase 4 Policy & NDC Endpoints ---
  getInterventions(): Observable<InterventionEvidence[]> {
    return this.http.get<InterventionEvidence[]>(`${this.policyUrl}/interventions`);
  }

  getInterventionById(techId: string): Observable<InterventionEvidence> {
    return this.http.get<InterventionEvidence>(`${this.policyUrl}/interventions/${techId}`);
  }

  getNdcProfiles(): Observable<CountryNdcProfile[]> {
    return this.http.get<CountryNdcProfile[]>(`${this.policyUrl}/ndc`);
  }

  getNdcProfile(countryCode: string): Observable<CountryNdcProfile> {
    return this.http.get<CountryNdcProfile>(`${this.policyUrl}/ndc/${countryCode}`);
  }

  compareScenarioWithNdc(scenario: DecarbonizationScenarioResponse): Observable<ScenarioNdcComparison> {
    return this.http.post<ScenarioNdcComparison>(`${this.policyUrl}/compare-scenario`, scenario);
  }

  getPolicyOverview(countryCode: string): Observable<PolicyComparisonResponse> {
    return this.http.get<PolicyComparisonResponse>(`${this.policyUrl}/overview/${countryCode}`);
  }

  getOverview(opts: {
    year?: number;
    country?: string | null;
    continent?: string | null;
    gas?: string;
  }): Observable<EmissionsOverviewResponse> {
    let params = new HttpParams();
    if (opts.year) params = params.set('year', opts.year);
    if (opts.country) params = params.set('country', opts.country);
    if (opts.continent) params = params.set('continent', opts.continent);
    if (opts.gas) params = params.set('gas', opts.gas);
    return this.http.get<EmissionsOverviewResponse>(`${this.baseUrl}/overview`, {
      params,
    });
  }

  getSourcesInfo(): Observable<SourcesInfoResponse> {
    return this.http.get<SourcesInfoResponse>(`${this.baseUrl}/sources-info`);
  }

  getSectorSummary(opts: {
    year?: number;
    country?: string | null;
    continent?: string | null;
    gas?: string;
    limit?: number;
  }): Observable<SectorSummaryResponse> {
    let params = new HttpParams();
    if (opts.year) params = params.set('year', opts.year);
    if (opts.country) params = params.set('country', opts.country);
    if (opts.continent) params = params.set('continent', opts.continent);
    if (opts.gas) params = params.set('gas', opts.gas);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<SectorSummaryResponse>(`${this.baseUrl}/sectors`, {
      params,
    });
  }

  getSubsectorSummary(opts: {
    year?: number;
    country?: string | null;
    continent?: string | null;
    sector: string;
    gas?: string;
    limit?: number;
  }): Observable<SubsectorSummaryResponse> {
    let params = new HttpParams().set('sector', opts.sector);
    if (opts.year) params = params.set('year', opts.year);
    if (opts.country) params = params.set('country', opts.country);
    if (opts.continent) params = params.set('continent', opts.continent);
    if (opts.gas) params = params.set('gas', opts.gas);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<SubsectorSummaryResponse>(
      `${this.baseUrl}/subsectors`,
      { params }
    );
  }

  getCountrySummary(opts: {
    year?: number;
    continent?: string | null;
    sector?: string | null;
    gas?: string;
    limit?: number;
  }): Observable<CountrySummaryResponse> {
    let params = new HttpParams();
    if (opts.year) params = params.set('year', opts.year);
    if (opts.continent) params = params.set('continent', opts.continent);
    if (opts.sector) params = params.set('sector', opts.sector);
    if (opts.gas) params = params.set('gas', opts.gas);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<CountrySummaryResponse>(`${this.baseUrl}/countries`, {
      params,
    });
  }

  getContinentSummary(opts: {
    year?: number;
    sector?: string | null;
    gas?: string;
    limit?: number;
  }): Observable<ContinentSummaryResponse> {
    let params = new HttpParams();
    if (opts.year) params = params.set('year', opts.year);
    if (opts.sector) params = params.set('sector', opts.sector);
    if (opts.gas) params = params.set('gas', opts.gas);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<ContinentSummaryResponse>(
      `${this.baseUrl}/continents`,
      { params }
    );
  }

  getSources(opts: {
    year?: number;
    country?: string | null;
    continent?: string | null;
    sector?: string | null;
    subsector?: string | null;
    gas?: string;
    limit?: number;
  }): Observable<SourcesResponse> {
    let params = new HttpParams();
    if (opts.year) params = params.set('year', opts.year);
    if (opts.country) params = params.set('country', opts.country);
    if (opts.continent) params = params.set('continent', opts.continent);
    if (opts.sector) params = params.set('sector', opts.sector);
    if (opts.subsector) params = params.set('subsector', opts.subsector);
    if (opts.gas) params = params.set('gas', opts.gas);
    if (opts.limit) params = params.set('limit', opts.limit);
    return this.http.get<SourcesResponse>(`${this.baseUrl}/sources`, {
      params,
    });
  }
}
