import { TestBed } from '@angular/core/testing';

import { EmissionsService } from './emissions.service';

describe('EmissionsService', () => {
  let service: EmissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
