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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { workflowModes } from '../../../../../models/enums/workflowModes.constants';
import { DynamicFormPart, FormPart } from '../../../../../models/workflowFormParts.model';
import { Store } from '@ngrx/store';
import { AppState, selectWorkflowState } from '../../../../../stores/app.reducers';
import { WorkflowJobChanged, WorkflowJobTypeSwitched } from '../../../../../stores/workflows/workflows.actions';
import { WorkflowEntryModel, WorkflowEntryModelFactory } from '../../../../../models/workflowEntry.model';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss'],
})
export class JobComponent implements OnInit, OnDestroy {
  @Input() jobId: string;
  workflowModes = workflowModes;
  selectedJob: string;
  mode: string;
  jobData: WorkflowEntryModel[];
  jobDynamicParts: DynamicFormPart[];
  jobSwitchPart: FormPart;
  staticJobPart: FormPart;

  jobChanges: Subject<WorkflowEntryModel> = new Subject<WorkflowEntryModel>();
  jobChangesSubscription: Subscription;
  workflowSubscription: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.workflowSubscription = this.store.select(selectWorkflowState).subscribe((state) => {
      this.mode = state.workflowAction.mode;

      this.jobDynamicParts = state.workflowFormParts.dynamicParts.jobDynamicParts;
      this.jobSwitchPart = state.workflowFormParts.jobSwitchPart;
      this.staticJobPart = state.workflowFormParts.staticJobPart;

      const jobDataOption = state.workflowAction.workflowData.jobs.find((job) => job.jobId == this.jobId);
      this.jobData = !!jobDataOption ? jobDataOption.entries : [];

      const selected = this.jobData.find((value) => value.property == this.jobSwitchPart.property);
      this.selectedJob = !!selected ? selected.value : undefined;
    });

    this.jobChangesSubscription = this.jobChanges.pipe(delay(0)).subscribe((jobChange) => {
      if (jobChange.property == this.jobSwitchPart.property) {
        this.store.dispatch(
          new WorkflowJobTypeSwitched({
            jobId: this.jobId,
            jobEntry: WorkflowEntryModelFactory.create(jobChange.property, jobChange.value),
          }),
        );
      } else {
        this.store.dispatch(
          new WorkflowJobChanged({ jobId: this.jobId, jobEntry: WorkflowEntryModelFactory.create(jobChange.property, jobChange.value) }),
        );
      }
    });
  }

  getJobTypes(): string[] {
    return this.jobDynamicParts.map((part) => part.name);
  }

  getSelectedJobComponent(): FormPart[] {
    const jobDynamicPart = this.jobDynamicParts.find((jdp) => jdp.name == this.selectedJob);
    return jobDynamicPart ? jobDynamicPart.parts : this.jobDynamicParts[0].parts;
  }

  getValue(prop: string) {
    const val = this.jobData.find((value) => value.property == prop);
    return !!val ? val.value : undefined;
  }

  ngOnDestroy(): void {
    !!this.jobChangesSubscription && this.jobChangesSubscription.unsubscribe();
    !!this.workflowSubscription && this.workflowSubscription.unsubscribe();
  }
}
