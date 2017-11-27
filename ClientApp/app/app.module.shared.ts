import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http'; 
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { AppComponent } from './components/app/app.component';
import {GameComponent} from './components/game/game.component';


@NgModule({
    declarations: [
        AppComponent,
        GameComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        ToastModule.forRoot()             
    ]
})
export class AppModuleShared {
}
