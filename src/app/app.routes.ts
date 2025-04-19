import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { ExistingOrderComponent } from './components/existing-order/existing-order.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { authGuard } from './guard/auth.guard';
import { TimeStudyComponent } from './components/time-study/time-study.component';
import { StopWatchComponent } from './components/stop-watch/stop-watch.component';
import { CompanyComponent } from './components/company/company.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TableDesignComponent } from './components/order-details/table-design/table-design.component';

export const routes: Routes = [
  // 🔓 Public routes (only for guests)
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [authGuard],
    data: { guestOnly: true },
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [authGuard],
    data: { guestOnly: true },
  },

  // 🔐 Authenticated routes
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'add-order', component: NewOrderComponent },
      { path: 'orders', component: ExistingOrderComponent },
      { path: 'users', component: UsersListComponent },
      { path: 'order/:styleNo', component: OrderDetailsComponent },
      { path: 'time-study/:styleNo', component: TimeStudyComponent },
      { path: 'stop-watch', component: StopWatchComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'table/:styleNo', component: TableDesignComponent },
    ],
  },

  // 🔁 Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
