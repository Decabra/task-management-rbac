import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth/auth.actions';
import { ToastComponent } from './components/shared/toast.component';

@Component({
  imports: [RouterModule, ToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'dashboard';
  private store = inject(Store);

  ngOnInit(): void {
    // Initialize authentication state from localStorage on app startup
    this.store.dispatch(AuthActions.initializeAuth());
  }
}
