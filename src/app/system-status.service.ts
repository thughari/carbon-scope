import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, of } from 'rxjs';
import { switchMap, catchError, map, retry } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SystemStatusService {
  private readonly healthUrl = 'http://localhost:8080/api/health';

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
