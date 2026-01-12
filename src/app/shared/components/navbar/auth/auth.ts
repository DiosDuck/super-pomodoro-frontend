import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../../../services/user';
import { LastRouteService } from '../../../services/last-route';
import { navId } from '../../navbar.config';
import { nullableUser } from '../../../models/user';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './auth.html',
  imports: [RouterLink],
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  userService = inject(UserService);
  router = inject(Router);
  lastRouteService = inject(LastRouteService);

  user = signal<nullableUser>(null);

  onSelect = output<navId>();

  ngOnInit(): void {
    this.userService.user.subscribe(user => this.user.set(user));
  }

  async onLogout(): Promise<void>
  {
    this.userService.logout();
    await this.lastRouteService.redirectToLastRoute();
  }

  saveCurrentUrl(): void
  {
    this.lastRouteService.updateLastRoute();
  }

  toggle() {
    this.onSelect.emit(null);
  }
}
