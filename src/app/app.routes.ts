import { Routes } from '@angular/router';
import { CounterPageComponent } from './pages/counter/counter-page-component';
import { HeroPageComponent } from './pages/hero/hero-page-component';
import { TablasPageComponent } from './pages/tablas/tablas-page-component';

export const routes: Routes = [
    {
        path: '',
        component: CounterPageComponent
    },
    {
        path: 'hero',
        component: HeroPageComponent
    },
    {
        path: 'tablas',
        component: TablasPageComponent
    }
];
