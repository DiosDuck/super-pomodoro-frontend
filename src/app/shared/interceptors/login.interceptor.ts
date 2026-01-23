import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { inject } from "@angular/core";
import { UserToken } from "../utils/user.service";
import { AuthService, SKIP_TOKEN } from "../../auth/auth.service";

export function userInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    const authService = inject(AuthService);
    const token = authService.getToken();
    if (token === null || req.context.get(SKIP_TOKEN)) {
        return next(req);
    }

    return makeAuthorizationCall(req, next, token)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return handleUnauthorizedError(req, next, authService)
          }

          return throwError(() => error);
        })
      )
    ;
}

function handleUnauthorizedError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  return authService.refreshToken()
    .pipe(
      switchMap(user => {
        return makeAuthorizationCall(req, next, authService.getToken()!);
      }),
    );
}

function makeAuthorizationCall(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  token: string,
): Observable<HttpEvent<unknown>> {
    return next(req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }));
}
