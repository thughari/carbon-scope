import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface HealthTelemetry {
  status: string;
  version?: string;
  engine?: string;
  activeDataSources?: string[];
  cache?: {
    size: number;
    hits: number;
    misses: number;
    hitRate: string;
  };
  serverTime?: string;
}

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly healthUrl = `${environment.apiUrl}/api/health`;

  private isOnlineSubject = new BehaviorSubject<boolean>(false);
  public isOnline$ = this.isOnlineSubject.asObservable();

  private healthSubject = new BehaviorSubject<HealthTelemetry | null>(null);
  public health$ = this.healthSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startHealthCheck();
  }

  private startHealthCheck() {
    timer(0, 30000)
      .pipe(
        switchMap(() =>
          this.http.get<HealthTelemetry>(this.healthUrl).pipe(
            catchError((err) => {
              console.warn('Backend health check error:', err);
              return of(null);
            })
          )
        )
      )
      .subscribe((data) => {
        if (data && data.status === 'UP') {
          this.isOnlineSubject.next(true);
          this.healthSubject.next(data);
        } else {
          this.isOnlineSubject.next(false);
          this.healthSubject.next(null);
        }
      });
  }
}
