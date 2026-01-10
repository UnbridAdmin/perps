import { Injectable, ComponentRef, ApplicationRef, EnvironmentInjector, createComponent } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

export interface DialogConfig {
  title?: string;
  message1?: string;
  message2?: string;
  message3?: string;
  image_icon?: string;
  leftButton?: string;
  rightButton?: string;
  leftButtonActive?: boolean;
  rightButtonActive?: boolean;
  disableClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogRef: ComponentRef<ConfirmDialogComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  /**
   * Muestra un mensaje informativo simple (solo botón de aceptar)
   */
  showInfo(config: DialogConfig): Promise<boolean> {
    const defaultConfig: DialogConfig = {
      title: 'Información',
      leftButtonActive: false,
      rightButton: 'Aceptar',
      rightButtonActive: true,
      disableClose: false,
      ...config
    };

    return this.showDialog(defaultConfig);
  }

  /**
   * Muestra un mensaje de confirmación (botones aceptar/cancelar)
   */
  showConfirm(config: DialogConfig): Promise<boolean> {
    const defaultConfig: DialogConfig = {
      title: 'Confirmar',
      leftButton: 'Cancelar',
      rightButton: 'Aceptar',
      leftButtonActive: true,
      rightButtonActive: true,
      disableClose: false,
      ...config
    };

    return this.showDialog(defaultConfig);
  }

  /**
   * Muestra un mensaje de error
   */
  showError(config: DialogConfig): Promise<boolean> {
    const defaultConfig: DialogConfig = {
      title: 'Error',
      leftButtonActive: false,
      rightButton: 'Aceptar',
      rightButtonActive: true,
      disableClose: false,
      image_icon: 'assets/icons/error-icon.png', // Puedes agregar un icono de error
      ...config
    };

    return this.showDialog(defaultConfig);
  }

  /**
   * Muestra un mensaje de éxito
   */
  showSuccess(config: DialogConfig): Promise<boolean> {
    const defaultConfig: DialogConfig = {
      title: 'Éxito',
      leftButtonActive: false,
      rightButton: 'Aceptar',
      rightButtonActive: true,
      disableClose: false,
      image_icon: 'assets/icons/success-icon.png', // Puedes agregar un icono de éxito
      ...config
    };

    return this.showDialog(defaultConfig);
  }

  /**
   * Método genérico para mostrar el diálogo
   */
  private showDialog(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      // Crear el componente dinámicamente
      this.dialogRef = createComponent(ConfirmDialogComponent, {
        environmentInjector: this.injector
      });

      // Configurar las propiedades
      Object.assign(this.dialogRef.instance, config);

      // Configurar los eventos
      this.dialogRef.instance.emitSuccess.subscribe(() => {
        this.closeDialog();
        resolve(true);
      });

      this.dialogRef.instance.emitCancel.subscribe(() => {
        this.closeDialog();
        resolve(false);
      });

      // Agregar al DOM
      this.appRef.attachView(this.dialogRef.hostView);
      const domElem = (this.dialogRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  /**
   * Cierra el diálogo actual
   */
  private closeDialog(): void {
    if (this.dialogRef) {
      this.appRef.detachView(this.dialogRef.hostView);
      this.dialogRef.destroy();
      this.dialogRef = null;
    }
  }
}