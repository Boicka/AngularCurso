import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablas-page-component',
  imports: [AgGridModule, CommonModule, FormsModule],
  templateUrl: './tablas-page-component.html',
  styleUrl: './tablas-page-component.css'
})
export class TablasPageComponent implements OnInit {

  gridApi: GridApi | null = null;
  currentPage = 0;
  totalPages = 0;

  // Tamaños de página disponibles
  pageSize = 1; // valor inicial
  pageSizeOptions = [1, 2, 3, 4, 5, 100];

  // NUEVO: estado del quick filter + debounce
  filterText = '';
  private quickFilterTimer: any = null;

  /**
   * Variable que contiene las columnas de la tabla.
   * ColDefs es propio de aggrid es su tipo de dato.
   */
  colDefs: ColDef[] = [
    {
      field: "company", headerName: 'Datos de la compania',
      // cellRenderer: (params: any) => {
      //   const company = params.value;
      //   if (!company) return '';

      //   return `
      //   Nombre: ${company.name}
      //   Frase: ${company.catchPhrase}
      //   Sector: ${company.bs}
      // `;
      // }
      /**
       * 
       * @param params es el valor de mi fila que viene del API (en mi caso un Object) 
       * @returns una string (porque asi lo requiero YO) pero puede ser cualquier dato primitivo
       * valueFormatter sirve para renderizar valores primitivos viniendo de estructuras de datos mas complejos
       * por ejemplo un json o un Object de JS
       * cellRenderer sirve para renderizar HTML cosas aun mas complejas
       */
      valueFormatter: (params) => {
        const c = params.value;
        return c ? `Nombre: ${c.name} | Frase: ${c.catchPhrase} | Sector: ${c.bs}` : '';
      }
    },
    { field: "name", headerName: 'Nombre', filter: 'agTextColumnFilter' },
    { field: "username", headerName: 'Nickname' },
    { field: "email", headerName: 'Correo' },
  ];
  /**
   * Variable para establecer la configuracion/comportamiento
   * por default de las columnas de la tabla y un poco estilos
   */
  defaultColDef = {
    flex: 1,
    minWidth: 100
  }
  /**
   * @GridOptions es la variable para traducir los nombres de los filtros a espanol
   */
  // En tu componente Angular
  gridOptions: GridOptions = {
    localeText: {
      // Traducimos los elementos del filtro de texto
      filterOoo: 'Filtrar...',
      equals: 'Igual a',
      notEqual: 'Distinto de',
      contains: 'Contiene',
      notContains: 'No contiene',
      startsWith: 'Empieza con',
      endsWith: 'Termina con',
      andCondition: 'Y',
      orCondition: 'O',
      applyFilter: 'Aplicar',
      resetFilter: 'Restablecer',
      clearFilter: 'Limpiar',
      cancelFilter: 'Cancelar',
      // Otros (opcional)
      noRowsToShow: 'No hay filas para mostrar',
      loadingOoo: 'Cargando...',
      searchOoo: 'Buscar...',
    },
    pagination: true,
    paginationPageSize: 1,
    // acelera el quick filter para datasets medianos/grandes
    cacheQuickFilter: true,
    // muestra filtros por columna bajo los headers
    // floatingFilter: true,
  };


  /**
   * @userList Variable que se usa llenar la tabla
   */
  userList: any[] = [];


  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.http.get('https://jsonplaceholder.typicode.com/users').subscribe((res: any) => {
      console.log(res);
      this.userList = res;
    })
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    // Establece el page size inicial vía API moderna:
    this.gridApi.setGridOption('paginationPageSize', this.pageSize); // ✅ v31+ / v34
    this.updatePaginationInfo();
  }
  
  // 4) evento antes de destruir el grid
  onGridPreDestroy(): void {
    this.gridApi = null;  // rompe referencias para que no se usen después
  }


  updatePaginationInfo() {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage();
    this.totalPages = this.gridApi.paginationGetTotalPages();
  }

  onPaginationChanged(): void {
    if (!this.gridApi) return;
    this.currentPage = this.gridApi.paginationGetCurrentPage();
    this.totalPages = this.gridApi.paginationGetTotalPages();
    this.pageSize = this.gridApi.paginationGetPageSize(); // refleja cambios si se usan otros selectores
  }

  onPageSizeChanged(newSize: number): void {
    this.pageSize = newSize;
    // Cambiar el tamaño de página de forma soportada en v34:
    this.gridApi.setGridOption('paginationPageSize', newSize); // ✅ oficial
    // Opcional: ir a la primera página tras cambiar el tamaño
    this.gridApi.paginationGoToFirstPage();
    this.updatePaginationInfo();
  }

  goToFirstPage() {
    this.gridApi.paginationGoToFirstPage();
    this.updatePaginationInfo();
  }

  goToPreviousPage() {
    this.gridApi.paginationGoToPreviousPage();
    this.updatePaginationInfo();
  }

  goToNextPage() {
    this.gridApi.paginationGoToNextPage();
    this.updatePaginationInfo();
  }

  goToLastPage() {
    this.gridApi.paginationGoToLastPage();
    this.updatePaginationInfo();
  }

  // Seccion para la barra de busqueda

  // Llama a esto desde (ngModelChange) del input
  onQuickFilterChange(value: string) {
    this.filterText = value ?? '';
    // Debounce para no recalcular en cada tecla
    if (this.quickFilterTimer) clearTimeout(this.quickFilterTimer);
    this.quickFilterTimer = setTimeout(() => {
      // Método soportado en v31+ / v34 para cambiar opciones en caliente
      this.gridApi.setGridOption('quickFilterText', this.filterText);
      // Si quieres, vuelve a la 1ª página cuando cambie el filtro:
      this.gridApi.paginationGoToFirstPage();
      this.updatePaginationInfo();
    }, 180);
  }

  clearQuickFilter() {
    this.onQuickFilterChange('');
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv();
  }

}
