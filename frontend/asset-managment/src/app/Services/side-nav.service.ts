import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideNavService {
  private isVisible = new BehaviorSubject<boolean>(true);
  private isFormOpen = new BehaviorSubject<boolean>(false);

  isVisible$ = this.isVisible.asObservable();
  isFormOpen$ = this.isFormOpen.asObservable();

  constructor() {}

  show() {
    this.isVisible.next(true);
  }

  hide() {
    this.isVisible.next(false);
  }

  toggle() {
    this.isVisible.next(!this.isVisible.value);
  }

  openForm() {
    this.isFormOpen.next(true);
  }

  closeForm() {
    this.isFormOpen.next(false);
  }
}
