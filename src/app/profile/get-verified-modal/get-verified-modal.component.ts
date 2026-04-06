import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GetVerifiedModalService } from './get-verified-modal.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { UserProfileResponse } from '../../shared/models/user-profile.model';

@Component({
  selector: 'app-get-verified-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './get-verified-modal.component.html',
  styleUrl: './get-verified-modal.component.scss'
})
export class GetVerifiedModalComponent {
  @Input() userProfile!: UserProfileResponse;
  public isLoading: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private getVerifiedService: GetVerifiedModalService,
    private confirmDialogService: ConfirmDialogService
  ) { }

  /**
   * Submit verification request
   */
  public getVerified(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.getVerifiedService.getVerified().subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        if (resp.success || resp.message === 'SUCCESS') {
          this.confirmDialogService.showSuccess({
            title: '¡Verificado!',
            message1: 'Ahora eres un Guardián verificado de la red Fierce.',
            message2: 'Tu marca de verificación aparecerá en tu perfil de inmediato.'
          });
          this.activeModal.close(true);
        } else {
          this.confirmDialogService.showError({
            title: 'Error',
            message1: resp.message || 'No se pudo procesar la verificación.'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error in verification process:', err);
        this.confirmDialogService.showError({
          title: 'Error',
          message1: err.error?.message || 'Hubo un problema al procesar tu solicitud. Asegúrate de tener suficiente saldo.'
        });
      }
    });
  }
}
