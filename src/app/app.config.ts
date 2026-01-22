import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { userInterceptor } from './shared/interceptors/login.interceptor';
import { UserService } from './shared/utils/user.service';
import { loaderInterceptor } from './shared/interceptors/loader.interceptor';
import { take } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withRouterConfig({onSameUrlNavigation: 'reload'})),
    provideHttpClient(withInterceptors([userInterceptor, loaderInterceptor])),
    provideAppInitializer(() => {
      const userService = inject(UserService);
      return userService.loadUser().pipe(take(1));
    })
  ]
};
