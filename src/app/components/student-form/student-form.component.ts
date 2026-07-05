import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Student } from 'src/app/models/student';
import { StudentService } from 'src/app/core/services/student.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {

  studentForm!: FormGroup;

  isEdit = false;

  courses: string[] = [
    'Java',
    'Python',
    'Angular',
    'Spring Boot',
    'React',
    'Node JS'
  ];

  today = new Date();

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<StudentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Student
  ) {}

  noFutureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate > today ? { futureDate: true } : null;
  }

  ngOnInit(): void {

    this.studentForm = this.fb.group({

      name: [
        '',
        [Validators.required, Validators.minLength(3)]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      course: [
        '',
        Validators.required
      ],

      address: [
        '',
        Validators.required
      ],

      gender: [
        '',
        Validators.required
      ],

      dob: [
        '',
        [Validators.required, this.noFutureDateValidator]
      ]

    });

    if (this.data) {

      this.isEdit = true;

      this.studentForm.patchValue(this.data);

    }

  }

    saveStudent(): void {

    if (this.studentForm.invalid) {

      this.studentForm.markAllAsTouched();

      return;

    }

    if (this.isEdit) {

      this.studentService.updateStudent(
        this.data.id!,
        this.studentForm.value
      ).subscribe({

        next: () => {

          this.snackBar.open(
            '✅ Student Updated Successfully',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );

          this.dialogRef.close(true);

        },
        error: (err) => {
          console.error('Update failed:', err);
          this.snackBar.open(
            '❌ Failed to update student. Please try again.',
            'Close',
            {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
        }

      });

    } else {

      this.studentService.addStudent(
        this.studentForm.value
      ).subscribe({

        next: () => {

          this.snackBar.open(
            '✅ Student Added Successfully',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );

          this.dialogRef.close(true);

        },
        error: (err) => {
          console.error('Add failed:', err);
          this.snackBar.open(
            '❌ Failed to add student. Please try again.',
            'Close',
            {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
        }

      });

    }

  }

  close(): void {

    this.dialogRef.close();

  }

}