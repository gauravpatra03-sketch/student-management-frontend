import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ViewChild, AfterViewInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudentFormComponent } from '../student-form/student-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Student } from 'src/app/models/student';
import { StudentService } from 'src/app/core/services/student.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit, AfterViewInit {

  maleStudents = 0;
  femaleStudents = 0;

  dataSource = new MatTableDataSource<Student>();
  students: Student[] = [];

  searchText: string = '';

  loading = false;

  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'mobile',
    'course',
    'gender',
    'dob',
    'actions'
  ];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.loadStudents();

  }

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.dataSource.paginator = this.paginator;

      this.dataSource.sort = this.sort;

    });

  }

  loadStudents(): void {

    this.loading = true;

    this.studentService.getStudents().subscribe({

      next: (response) => {

        this.students = response;

        this.dataSource.data = response;

        this.loading = false;

        // Calculate counts INSIDE next to fix the async statistics bug
        this.maleStudents =
          this.students.filter(s => s.gender === 'Male').length;

        this.femaleStudents =
          this.students.filter(s => s.gender === 'Female').length;

      },

      error: (error) => {

        console.error('Error fetching students:', error);

        this.loading = false;

        this.snackBar.open(
          '❌ Failed to load student records from server.',
          'Dismiss',
          {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });

      }

    });

  }

  searchStudent(): void {

    if (this.searchText.trim() === '') {

      this.loadStudents();

      return;

    }

    this.studentService.searchStudent(this.searchText).subscribe({

      next: (response) => {

        this.dataSource.data = response;

        // Update counts for search results
        this.maleStudents =
          response.filter(s => s.gender === 'Male').length;

        this.femaleStudents =
          response.filter(s => s.gender === 'Female').length;

      },

      error: (error) => {

        console.error('Search failed:', error);

      }

    });

  }

  addStudent(): void {

    const dialogRef = this.dialog.open(StudentFormComponent, {

      width: '650px',

      disableClose: true

    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loadStudents();

      }

    });

  }

  editStudent(student: Student): void {

    const dialogRef = this.dialog.open(StudentFormComponent, {

      width: '650px',

      disableClose: true,

      data: student

    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loadStudents();

      }

    });

  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.name}? This will permanently remove their records.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.studentService.deleteStudent(student.id!).subscribe({
          next: () => {
            this.snackBar.open(
              '🗑️ Student deleted successfully',
              'Dismiss',
              {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              });
            this.loadStudents();
          },
          error: (err) => {
            this.loading = false;
            console.error('Delete failed:', err);
            this.snackBar.open(
              '❌ Failed to delete student. Server error.',
              'Dismiss',
              {
                duration: 3500,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              });
          }
        });
      }
    });
  }

  exportToExcel(): void {
    if (this.students.length === 0) {
      this.snackBar.open('⚠️ No student data available to export', 'Close', { duration: 3000 });
      return;
    }
    
    const dataToExport = this.students.map((student, index) => ({
      'S.No': index + 1,
      'Student ID': student.id || '',
      'Name': student.name,
      'Email': student.email,
      'Mobile': student.mobile,
      'Course': student.course,
      'Gender': student.gender,
      'Date of Birth': student.dob,
      'Address': student.address
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Auto-fit column widths
    const maxLens = dataToExport.reduce((acc, row) => {
      Object.keys(row).forEach((key) => {
        const val = row[key as keyof typeof row]?.toString() || '';
        acc[key] = Math.max(acc[key] || 0, val.length, key.length);
      });
      return acc;
    }, {} as Record<string, number>);

    worksheet['!cols'] = Object.keys(maxLens).map((key) => ({
      wch: maxLens[key] + 3
    }));

    XLSX.writeFile(workbook, `student_records_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.snackBar.open('✅ Exported to Excel successfully!', 'Close', { duration: 3000 });
  }

  exportToPDF(): void {
    if (this.students.length === 0) {
      this.snackBar.open('⚠️ No student data available to export', 'Close', { duration: 3000 });
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Add title header
    doc.setFontSize(18);
    doc.text('Student Course Management System - Student Records', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const head = [['ID', 'Name', 'Email', 'Mobile', 'Course', 'Gender', 'Date of Birth', 'Address']];
    const body = this.students.map(s => [
      s.id ? `#${s.id}` : '',
      s.name,
      s.email,
      s.mobile,
      s.course,
      s.gender,
      s.dob,
      s.address
    ]);

    import('jspdf-autotable').then((module) => {
      const autoTableFn = module.default || module;
      (autoTableFn as any)(doc, {
        head: head,
        body: body,
        startY: 34,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // matching matching primary indigo color
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 'auto' }
        }
      });
      doc.save(`student_records_${new Date().toISOString().slice(0, 10)}.pdf`);
      this.snackBar.open('✅ Exported to PDF successfully!', 'Close', { duration: 3000 });
    }).catch(err => {
      console.error('Error loading jspdf-autotable:', err);
      this.snackBar.open('❌ PDF export failed to initialize', 'Close', { duration: 3000 });
    });
  }

  logout(): void {

    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');

    this.router.navigate(['/login']);

  }

}
