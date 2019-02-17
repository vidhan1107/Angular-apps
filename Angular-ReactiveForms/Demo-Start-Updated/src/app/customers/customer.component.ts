import { Component, OnInit } from '@angular/core';

import { Customer } from './customer';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');

  console.log('Email : ', emailControl);
  console.log('Confirm : ', confirmControl);

  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }

  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { 'match': true };
}

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): {[key: string]: Boolean } | null => {
      if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
        return { 'range': true };
      }
    return null;
  };
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  get addresses(): FormArray {
    return <FormArray>this.customerForm.get('addresses');
  }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      }, { Validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: ['', ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([ this.buildAddress() ])
    });

    this.customerForm.get('notification').valueChanges
                     .subscribe(value => this.setNotification(value));
  }

  save(customerForm: FormGroup) {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'Home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    });
  }

  addAddress(): void {
    this.addresses.push(this.buildAddress());
  }

  populateTestData(): void {
    this.customerForm.setValue({
      firstName: 'vidhan',
      lastName: 'patel',
      email: 'vidhan.p@gmail.com',
      sendCatalog: false
    });
  }

  setNotification(NotifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (NotifyVia === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }
}
