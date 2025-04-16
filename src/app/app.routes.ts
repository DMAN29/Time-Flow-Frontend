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
// import { StopWatchComponent } from './components/time-study/stop-watch/stop-watch.component';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
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
      {
        path: 'order/:styleNo',
        component: OrderDetailsComponent,
      },
      {
        path: 'time-study/:styleNo',
        component: TimeStudyComponent,
      },
      {
        path: 'stop-watch',
        component: StopWatchComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
