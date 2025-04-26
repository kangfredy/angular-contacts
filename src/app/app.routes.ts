import { Routes } from '@angular/router';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/contacts', pathMatch: 'full' },
  {
    path: 'contacts',
    component: ContactListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'contacts/add',
    component: ContactFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'contacts/edit/:id',
    component: ContactFormComponent,
    canActivate: [authGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '/contacts' },
];
