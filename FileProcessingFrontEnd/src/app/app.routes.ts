
import { Routes } from '@angular/router';

import { Home } from './features/home/home';
import { Merge } from './features/merge/merge';
import { Split } from './features/split/split';

import { Layout } from './layout/layout';

export const routes: Routes = [

{
 path:'',
 component:Layout,

 children:[

   {
    path:'',
    component:Home
   },

   {
    path:'merge',
    component:Merge
   },

   {
    path:'split',
    component:Split
   }

 ]

},


{
 path:'**',
 redirectTo:''
}

];