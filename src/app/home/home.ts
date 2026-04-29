import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NAV_MENU_ITEMS } from '../shared/configs/nav-items';
import { LoggedInPipe } from '../shared/pipes/user.pipe';
import { NullableUser, UserService } from '../auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LoggedInPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private userService = inject(UserService);
  user = toSignal(this.userService.user$, { initialValue: null as NullableUser });
  navItems = NAV_MENU_ITEMS;
}
