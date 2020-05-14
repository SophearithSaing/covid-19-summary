import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'covid-info';

  isLoading = true;

  global = null;
  countries = [];
  showCountries = [];

  pageOfItems: Array<any>;
  totalCountries = 0;
  countriesPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<{ Global: any, Countries: any }>('https://api.covid19api.com/summary')
    .pipe(
      retry(5), // retry a failed request up to 3 times
      catchError(this.handleError) // then handle the error
    )
    .subscribe(data => {
      this.global = data.Global;
      this.countries = data.Countries;
      this.totalCountries = this.countries.length;
      this.showCountries = this.countries.slice(0, this.countriesPerPage);
      // console.log(this.data);
      this.isLoading = false;
      // console.log(this.countriesPerPage * (this.currentPage - 1),
      //                                      this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);

    });
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.countriesPerPage = pageData.pageSize;
    this.showCountries = this.countries.slice(this.countriesPerPage * (this.currentPage - 1),
                                              this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);
    // console.log(this.countriesPerPage * (this.currentPage - 1), this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);
    // console.log(this.showCountries);
    // this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
