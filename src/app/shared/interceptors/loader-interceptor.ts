import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { LoaderService } from "../services/loader";

const LOADER_URLS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/pomodoro/session/history',
    '/api/auth/password/forgot-password',
    '/api/profile',
];

export function loaderInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>>
{
    if (!LOADER_URLS.includes(req.url)) {
        return next(req);
    }

    let loaderService = inject(LoaderService);
    loaderService.startLoading();

    return next(req).pipe(finalize(() => loaderService.stopLoading()));
}