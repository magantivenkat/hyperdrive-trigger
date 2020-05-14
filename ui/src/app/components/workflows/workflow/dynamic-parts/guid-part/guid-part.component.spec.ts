/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidPartComponent } from './guid-part.component';
import { DebugElement, Predicate } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { WorkflowEntryModel } from '../../../../../models/workflowEntry.model';

describe('GuidPartComponent', () => {
  let fixture: ComponentFixture<GuidPartComponent>;
  let underTest: GuidPartComponent;

  const inputSelector: Predicate<DebugElement> = By.css('input[type="text"]');
  const buttonSelector: Predicate<DebugElement> = By.css('button[type="button"]');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GuidPartComponent],
      imports: [FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidPartComponent);
    underTest = fixture.componentInstance;
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  describe('should set new guid on init when value is undefined or null', () => {
    const parameters = [null, undefined];

    parameters.forEach((parameter) => {
      it(
        'should pass with ' + parameter + ' value',
        async(() => {
          const oldValue = parameter;
          const propertyName = 'property';
          const testedSubject = new Subject<WorkflowEntryModel>();
          const subjectSpy = spyOn(testedSubject, 'next');

          underTest.isShow = false;
          underTest.name = 'name';
          underTest.value = oldValue;
          underTest.property = propertyName;
          underTest.valueChanges = testedSubject;
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            const result = fixture.debugElement.query(inputSelector).nativeElement.value;
            expect(result.length).toBe(36);
            expect(subjectSpy).toHaveBeenCalledTimes(1);
            expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, result));
          });
        }),
      );
    });
  });

  it('should change value and publish change on user input', async(() => {
    const propertyName = 'property';
    const testedSubject = new Subject<WorkflowEntryModel>();
    const subjectSpy = spyOn(testedSubject, 'next');

    underTest.isShow = false;
    underTest.name = 'name';
    underTest.value = null;
    underTest.property = propertyName;
    underTest.valueChanges = testedSubject;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const inputElement = fixture.debugElement.query(inputSelector).nativeElement;
      const oldValue = inputElement.value;

      expect(oldValue.length).toBe(36);
      expect(subjectSpy).toHaveBeenCalled();
      expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, oldValue));

      const buttonElement = fixture.debugElement.query(buttonSelector).nativeElement;
      buttonElement.click();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const testedValue = fixture.debugElement.query(inputSelector).nativeElement.value;
        expect(testedValue.length).toBe(36);
        expect(oldValue != testedValue).toBeTrue();
        expect(subjectSpy).toHaveBeenCalled();
        expect(subjectSpy).toHaveBeenCalledWith(new WorkflowEntryModel(propertyName, testedValue));
      });
    });
  }));

  it('getUUID() should generate unique uuid', () => {
    const uuids: string[] = [];

    for (let i = 0; i < 100; i++) {
      const uuid = underTest.getUUID();
      uuids.push(uuid);
    }

    expect(new Set(uuids).size == uuids.length).toBeTrue();

    uuids.forEach(function (uuid: string) {
      expect(uuid.length).toBe(36);
    });
  });
});