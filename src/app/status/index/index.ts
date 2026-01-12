import { Component } from '@angular/core';
import { STATUS_LIST } from '../config';
import { Line } from '../line/line';

@Component({
  selector: 'app-status',
  imports: [Line],
  templateUrl: './index.html',
  styleUrl: './index.scss'
})
export class Index {
  statusList = STATUS_LIST;
}
