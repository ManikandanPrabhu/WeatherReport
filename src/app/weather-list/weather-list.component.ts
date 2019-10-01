import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, SimpleChanges } from '@angular/core';
import { Subject, fromEvent, of, Subscription } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { WeatherDialogComponent } from '../weather-dialog/weather-dialog.component';

@Component({
  selector: 'app-weather-list',
  templateUrl: './weather-list.component.html',
  styleUrls: ['./weather-list.component.less']
})
export class WeatherListComponent implements OnInit, AfterViewInit {

  model: any = {};
  apiResponse:any;
  isSearching:boolean;
  subscribedData: Subscription;
  onLoad: boolean = true;
  noDataFound: boolean = false;
  @ViewChild('f', {static: true}) formData: ElementRef;
  @ViewChild('locationName', {static: true}) locationInput: ElementRef;

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.isSearching = false;
    this.apiResponse = [];
  }


  ngOnInit() {
    console.log(this.formData);
    this.subscribedData = fromEvent(this.locationInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      ,filter(res => {
        if (res.length > 2) {
          return true;
        } else {
          this.apiResponse = [];
          this.noDataFound = false;
          this.onLoad = true;
          return false;
        }
      })
      // Time in milliseconds between key events
      ,debounceTime(1000)
      // If previous query is diffent from current
      ,distinctUntilChanged()
      // subscription for response
      ).subscribe((text: string) => {
        this.isSearching = true;
        this.searchGetCall(text).subscribe((res: any)=>{
          console.log('res',res);
          if (res && res.length > 0) {
            console.log("inside");
            this.noDataFound = false;
          } else {
            console.log("outside");
            this.noDataFound = true;
          }
          this.isSearching = false;
          this.onLoad = false;
          this.apiResponse = res;

        },(err)=>{
          this.isSearching = false;
          console.log('error',err);
        });
      });
  }
  ngAfterViewInit() {
    console.log('Hello ', this.formData);
  }

  searchGetCall(term: string) {
  const weatherAPI = 'https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?query=';

    if (term === '') {
      return of([]);
    }
    return this.http.get(`${weatherAPI}${term}`);
  }

  // Open Modal Dialog
  openDialog(info) {
    this.dialog.open(WeatherDialogComponent, { width: '650px', data : info });
}
}



