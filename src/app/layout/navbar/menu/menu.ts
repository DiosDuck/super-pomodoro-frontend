import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { LoggedInPipe } from '../../../shared/pipes/user';
import { UserService } from '../../../shared/services/user';
import { nullableUser } from '../../../shared/models/user';
import { NAV_MENU_ITEMS } from '../../../shared/configs/nav-items';
import { navId } from '../navbar.model';

@Component({
  selector: 'app-nav-menu',
  imports: [RouterLink, LoggedInPipe],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  navItems = NAV_MENU_ITEMS;
  
  userService = inject(UserService);
  user = signal<nullableUser>(null);

  router = inject(Router);

  onSelect = output<navId>();

  ngOnInit(): void {
    this.userService.user.subscribe(
      user => this.user.set(user)
    );
  }

  toggle() {
    this.onSelect.emit(null);
  }
}
