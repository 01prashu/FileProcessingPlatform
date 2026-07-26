import { Component } from '@angular/core';
//import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../shared/navbar/navbar';
import { Footer } from '../shared/footer/footer';
import { Sidebar } from '../shared/sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone:true,
  imports:[
    RouterOutlet,
    Navbar,
    Footer,
    Sidebar
],
  templateUrl:'./layout.html',
  styleUrl:'./layout.css'
})
export class Layout {

}