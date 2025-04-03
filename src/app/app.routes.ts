import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { ExistingOrderComponent } from './components/existing-order/existing-order.component';
import { UsersListComponent } from './components/users-list/users-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'add-order',
    component: NewOrderComponent,
  },
  {
    path: 'orders',
    component: ExistingOrderComponent,
  },
  {
    path: 'users',
    component: UsersListComponent,
  },
];
