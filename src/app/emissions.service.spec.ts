import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmissionsService } from './emissions.service';
import { EmissionsOverviewResponse } from '../models/emissions.models';

describe('EmissionsService', () => {
  let service: EmissionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EmissionsService
      ]
    });
    service = TestBed.inject(EmissionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request overview and handle explicit provenance and status', (done) => {
    const mockOverview: Partial<EmissionsOverviewResponse> = {
      country: 'IND',
      year: 2024,
      totalEmissionsMt: 4165.4,
      dataSourceStatus: 'LIVE_API_OBSERVATION',
      provenance: {
        status: 'LIVE_API_OBSERVATION',
        sourceName: 'Climate TRACE v6',
        empirical: true,
        reportingYear: 2024
      }
    };

    service.getOverview({ country: 'IND', year: 2024 }).subscribe(res => {
      expect(res.dataSourceStatus).toBe('LIVE_API_OBSERVATION');
      expect(res.provenance?.empirical).toBeTrue();
      expect(res.totalEmissionsMt).toBe(4165.4);
      done();
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/emissions/overview'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('country')).toBe('IND');
    expect(req.request.params.get('year')).toBe('2024');
    req.flush(mockOverview);
  });

  it('should handle DATA_UNAVAILABLE response honestly for out-of-range years', (done) => {
    const mockUnavailable: Partial<EmissionsOverviewResponse> = {
      country: 'IND',
      year: 2035,
      totalEmissionsMt: 0,
      dataSourceStatus: 'DATA_UNAVAILABLE',
      provenance: {
        status: 'DATA_UNAVAILABLE',
        empirical: false,
        qualityNotes: 'Year 2035 is outside coverage window.'
      }
    };

    service.getOverview({ country: 'IND', year: 2035 }).subscribe(res => {
      expect(res.dataSourceStatus).toBe('DATA_UNAVAILABLE');
      expect(res.provenance?.empirical).toBeFalse();
      expect(res.totalEmissionsMt).toBe(0);
      done();
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/emissions/overview'));
    req.flush(mockUnavailable);
  });
});
