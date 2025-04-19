import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = localStorage.getItem('token');
  const isLoggedIn = token && !jwtHelper.isTokenExpired(token);

  const guestOnly = route.data?.['guestOnly'] === true;

  if (!guestOnly && !isLoggedIn) {
    router.navigate(['/sign-in']);
    return false;
  }

  if (guestOnly && isLoggedIn) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
