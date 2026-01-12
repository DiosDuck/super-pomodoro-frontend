import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { UserToken } from "../services/user";

export function userInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    const userToken = inject(UserToken);
    const token = userToken.get();
    if (token === null) {
        return next(req);
    }

    return next(req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    }));
}
