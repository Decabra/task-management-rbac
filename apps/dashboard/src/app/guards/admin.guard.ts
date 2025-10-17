import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import * as AuthSelectors from '../store/auth/auth.selectors';

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthSelectors.selectCanAccessAudit).pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        // Redirect to tasks page if user doesn't have admin access
        router.navigate(['/tasks']);
        return false;
      }
    })
  );
};
