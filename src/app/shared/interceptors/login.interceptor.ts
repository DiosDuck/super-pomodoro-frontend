import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { inject } from "@angular/core";
import { SKIP_TOKEN, UserService, UserToken } from "../utils/user.service";

export function userInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    const userToken = inject(UserToken);
    const userService = inject(UserService);
    const token = userToken.get();
    if (token === null || req.context.get(SKIP_TOKEN)) {
        return next(req);
    }

    return makeAuthorizationCall(req, next, token.token)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.log('here');
            return handleUnauthorizedError(req, next, userToken, userService)
          }

          return throwError(() => error);
        })
      )
    ;
}

function handleUnauthorizedError(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  userToken: UserToken,
  userService: UserService,
): Observable<HttpEvent<unknown>> {
  return userService.refreshToken()
    .pipe(
      switchMap(token => {
        userToken.set(token);

        return makeAuthorizationCall(req, next, token.token);
      }),
      catchError((error) => {
        userService.logout();

        return throwError(() => error)
      })
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
