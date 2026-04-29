import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { LoggedInPipe } from '../../../shared/pipes/user.pipe';
import { NAV_MENU_ITEMS } from '../../../shared/configs/nav-items';
import { navId } from '../navbar.model';
import { NullableUser, UserService } from '../../../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav-menu',
  imports: [RouterLink, LoggedInPipe],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  navItems = NAV_MENU_ITEMS;

  private userService = inject(UserService);
  user = toSignal(this.userService.user$, { initialValue: null as NullableUser });

  router = inject(Router);

  onSelect = output<navId>();

  toggle() {
    this.onSelect.emit(null);
  }
}
