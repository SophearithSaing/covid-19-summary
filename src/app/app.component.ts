import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'covid-info';
  isLoading = true;
  data = null;
  countries = [];
  showCountries = [];

  pageOfItems: Array<any>;
  totalCountries = 0;
  countriesPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];


  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<{ Global: any, Countries: any }>('https://api.covid19api.com/summary').subscribe(data => {
      this.data = data;
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
}
