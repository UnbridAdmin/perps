import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { ApiServices } from './services/api.service';
import { AuthorizationService } from './services/authorization.service';
import { WalletConnectService } from './services/walletconnect.service';
import { CommonService } from './shared/commonService';
import { CacheService } from './services/cache.service';
import { ToastComponent } from './shared/toast/toast.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideToastr(),
    ApiServices,
    AuthorizationService,
    WalletConnectService,
    CommonService,
    CacheService,
    provideToastr({
      timeOut: 2500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      enableHtml: true,
      progressBar: true,
      toastComponent: ToastComponent
    }),
  ],
};
