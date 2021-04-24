import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Sort } from '@angular/material/sort';

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
  sortedCountries = [];

  pageOfItems: Array<any>;
  totalCountries = 0;
  countriesPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  constructor(private http: HttpClient) {
    this.sortedCountries = this.countries.slice();
  }

  ngOnInit() {
    this.http.get<{ Global: any, Countries: any }>('https://api.covid19api.com/summary')
      .pipe(
        retry(5), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      )
      .subscribe(data => {
        this.global = data.Global;
        // add percentages
        this.global.DeathsPercentage = ((this.global.TotalDeaths * 100) / this.global.TotalConfirmed).toFixed(2);
        this.global.RecoveredPercentage = ((this.global.TotalRecovered * 100) / this.global.TotalConfirmed).toFixed(2);
        this.countries = data.Countries;
        this.countries.forEach(element => {
          // add percentages
          element.DeathsPercentage = ((element.TotalDeaths * 100) / element.TotalConfirmed).toFixed(2);
          element.RecoveredPercentage = ((element.TotalRecovered * 100) / element.TotalConfirmed).toFixed(2);
        });
        this.sortedCountries = this.countries.slice();
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
    // this.showCountries = this.countries.slice(this.countriesPerPage * (this.currentPage - 1),
    this.showCountries = this.sortedCountries.slice(this.countriesPerPage * (this.currentPage - 1),
      this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);
    // console.log(this.countriesPerPage * (this.currentPage - 1), this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);
    console.log(this.sortedCountries);
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

  sortData(sort: Sort) {
    const data = this.countries.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedCountries = data;
      return;
    }

    // sort data
    this.sortedCountries = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Country': return compare(a.Country, b.Country, isAsc);
        case 'NewConfirmed': return compare(a.NewConfirmed, b.NewConfirmed, isAsc);
        case 'TotalConfirmed': return compare(a.TotalConfirmed, b.TotalConfirmed, isAsc);
        case 'NewDeaths': return compare(a.NewDeaths, b.NewDeaths, isAsc);
        case 'TotalDeaths': return compare(a.TotalDeaths, b.TotalDeaths, isAsc);
        case 'DeathsPercentage': return compare(a.DeathsPercentage, b.DeathsPercentage, isAsc);
        case 'NewRecovered': return compare(a.NewRecovered, b.NewRecovered, isAsc);
        case 'TotalRecovered': return compare(a.TotalRecovered, b.TotalRecovered, isAsc);
        case 'RecoveredPercentage': return compare(a.RecoveredPercentage, b.RecoveredPercentage, isAsc);
        default: return 0;
      }
    });
    this.showCountries = this.sortedCountries.slice(this.countriesPerPage * (this.currentPage - 1),
      this.countriesPerPage * (this.currentPage - 1) + this.countriesPerPage);
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
