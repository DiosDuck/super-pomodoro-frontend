import { Component, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { NAV_MENU_ITEMS } from '../../../configs/nav-items';
import { UserService } from '../../../services/user';
import { LoggedInPipe } from '../../../pipes/user';
import { navId } from '../../navbar.config';
import { nullableUser } from '../../../models/user';

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
