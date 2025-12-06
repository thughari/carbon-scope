import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  SectorSummaryResponse,
  SubsectorSummaryResponse,
  CountrySummaryResponse,
  ContinentSummaryResponse,
  SourcesResponse,
} from '../models/emissions.models';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmissionsService {
  private readonly baseUrl = `${environment.apiUrl}/api/emissions`;

  constructor(private http: HttpClient) {}

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
