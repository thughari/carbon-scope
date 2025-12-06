import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly healthUrl = `${environment.apiUrl}/api/health`;

  private isOnlineSubject = new BehaviorSubject<boolean>(false);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startHealthCheck();
  }

  private startHealthCheck() {
    timer(0, 30000)
      .pipe(
        switchMap(() =>
          this.http.get(this.healthUrl).pipe(
            map(() => true),
            catchError(() => of(false))
          )
        )
      )
      .subscribe((status) => {
        this.isOnlineSubject.next(status);
      });
  }
}
