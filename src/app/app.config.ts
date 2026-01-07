import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { ApiServices } from './services/api.service';
import { AuthorizationService } from './services/authorization.service';
import { WalletConnectService } from './services/walletconnect.service';
import { CommonService } from './shared/commonService';
import { CacheService } from './services/cache.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    ApiServices,
    AuthorizationService,
    WalletConnectService,
    CommonService,
    CacheService
  ],
};
