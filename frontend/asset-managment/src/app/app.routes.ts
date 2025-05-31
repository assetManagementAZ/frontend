import { Routes } from '@angular/router';
import { UsersComponent } from './Panel/users/users.component';
import { PanelComponent } from './Panel/panel.component';
import { BuildingsComponent } from './Panel/buildings/buildings.component';
import { ZonesComponent } from './Panel/zones/zones.component';
import { LoginComponent } from './Login/login.component';
import { OpSystemComponent } from './Panel/op-system/op-system.component';
import { OpVersionComponent } from './Panel/op-system/op-version/op-version.component';
import { ComputerComponent } from './Panel/computer/computer.component';
import { FeatureSetComponent } from './Panel/feature-set/feature-set.component';
import { PropertyFeatureComponent } from './Panel/property-feature/property-feature.component';
import { ProductCategoryComponent } from './Panel/product-category/product-category.component';
import { ProductComponent } from './Panel/product-category/product/product.component';
import { authGuard } from './Services/auth.guard';
import { ProfileComponent } from './Panel/profile/profile.component';

import { ProductFeatureCategoryOrderComponent } from './Panel/product-category/product-feature-category-order/product-feature-category-order.component';
import { DeliveredProductComponent } from './Panel/product-category/delivered-product/delivered-product.component';
import { SealComponent } from './Panel/seal/seal.component';
import { UsersPcComponent } from './Panel/users/users-pc/users-pc.component';
import { UsersDeliveredProductComponent } from './Panel/users/users-delivered-product/users-delivered-product.component';
import { SoftwareComponent } from './Panel/computer/software/software.component';
import { OwnTicketsComponent } from './Panel/TicketPages/own-tickets/own-tickets.component';
import { UsersTicketsComponent } from './Panel/TicketPages/users-tickets/users-tickets.component';
import { UserProfileComponent } from './Shared/user-profile/user-profile.component';
import { MainLayoutComponent } from './Shared/layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'panel',
        component: PanelComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'userProfile',
        component: UserProfileComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'usersPc',
        component: UsersPcComponent,
      },
      {
        path: 'usersDelivery',
        component: UsersDeliveredProductComponent,
      },
      {
        path: 'buildings',
        component: BuildingsComponent,
      },

      {
        path: 'zones',
        component: ZonesComponent,
      },
      {
        path: 'computer',
        component: ComputerComponent,
      },
      {
        path: 'software',
        component: SoftwareComponent,
      },
      {
        path: 'op',
        component: OpSystemComponent,
      },
      {
        path: 'version',
        component: OpVersionComponent,
      },
      {
        path: 'feature',
        component: FeatureSetComponent,
      },
      {
        path: 'prfeature',
        component: PropertyFeatureComponent,
      },
      {
        path: 'products/:category',
        component: ProductCategoryComponent,
      },
      {
        path: 'products',
        component: ProductComponent,
      },
      {
        path: 'deliveredProducts',
        component: DeliveredProductComponent,
      },
      {
        path: 'pfcOrder',
        component: ProductFeatureCategoryOrderComponent,
      },
      {
        path: 'seal',
        component: SealComponent,
      },
      {
        path: 'ownTicketPage',
        component: OwnTicketsComponent,
      },
      {
        path: 'userTicketPage',
        component: UsersTicketsComponent,
      },
    ],
  },
];
