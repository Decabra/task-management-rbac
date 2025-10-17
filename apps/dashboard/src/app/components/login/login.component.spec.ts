import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import * as AuthActions from '../../store/auth/auth.actions';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock store selectors
    (mockStore.select as jasmine.Spy).and.callFake((selector) => {
      if (selector.toString().includes('selectIsLoading')) {
        return of(false);
      }
      if (selector.toString().includes('selectError')) {
        return of(null);
      }
      return of(null);
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.invalid).toBeTruthy();
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    
    passwordControl?.setValue('');
    expect(passwordControl?.invalid).toBeTruthy();
    
    passwordControl?.setValue('123');
    expect(passwordControl?.invalid).toBeTruthy();
    
    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should dispatch login action when form is valid', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: AuthActions.login.type,
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        }
      })
    );
  });

  it('should not dispatch login action when form is invalid', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123'
    });

    component.onSubmit();

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
