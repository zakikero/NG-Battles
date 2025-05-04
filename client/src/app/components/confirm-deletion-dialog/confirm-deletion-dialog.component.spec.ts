import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmDeletionDialogComponent } from './confirm-deletion-dialog.component';
/* eslint-disable */

describe('ConfirmDeletionDialogComponent', () => {
    let component: ConfirmDeletionDialogComponent;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDeletionDialogComponent>>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            providers: [ConfirmDeletionDialogComponent, { provide: MatDialogRef, useValue: spy }],
        });
        component = TestBed.inject(ConfirmDeletionDialogComponent);
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ConfirmDeletionDialogComponent>>;
    });

    it('should call dialogRef.close with true when confirmDeletion is called', () => {
        component.confirmDeletion();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
});
