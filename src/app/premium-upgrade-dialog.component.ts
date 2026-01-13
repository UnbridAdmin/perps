import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FierceGuardianCharacterComponent } from './shared/fierce-guardian-character/fierce-guardian-character.component';
import { Character } from './shared/models/character.model';

@Component({
  selector: 'app-premium-upgrade-dialog',
  templateUrl: './premium-upgrade-dialog.component.html',
  styleUrls: ['./premium-upgrade-dialog.component.scss']
})
export class PremiumUpgradeDialogComponent {

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  closeDialog() {
    this.activeModal.close();
  }

  openCharacterModal(characterText: string) {
    const character = this.getCharacterFromText(characterText);
    if (!character) return;

    const modalRef = this.modalService.open(FierceGuardianCharacterComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });

    modalRef.componentInstance.character = character;
  }

  private getCharacterFromText(text: string): Character | null {
    const characterMap: { [key: string]: Character } = {
      'Wolf Character in Fierce Guardians Game': {
        id: 'pup',
        name: 'Wolf Pup',
        multiplier: 1,
        dailyBase: 303,
        unlocked: true,
        image: '',
        selectImage: '',
        gifImage: 'https://ipfs.unbrid.com/app/iron.gif'
      },
      'Alpha Character in Fierce Guardians Game': {
        id: 'alpha',
        name: 'Alpha Wolf',
        multiplier: 5,
        dailyBase: 1515,
        unlocked: true,
        image: '',
        selectImage: '',
        gifImage: 'https://ipfs.unbrid.com/app/shadowblade.gif'
      },
      'Beta Character in Fierce Guardians Game': {
        id: 'beta',
        name: 'Beta Wolf',
        multiplier: 10,
        dailyBase: 3030,
        unlocked: true,
        image: '',
        selectImage: '',
        gifImage: 'https://ipfs.unbrid.com/app/poseidon.gif'
      },
      'Elite Character in Fierce Guardians Game': {
        id: 'elite',
        name: 'Elite Guardian',
        multiplier: 25,
        dailyBase: 7576,
        unlocked: true,
        image: '',
        selectImage: '',
        gifImage: 'https://ipfs.unbrid.com/app/elite.gif'
      },
      'Legend Character in Fierce Guardians Game': {
        id: 'legend',
        name: 'Legendary Beast',
        multiplier: 50,
        dailyBase: 15152,
        unlocked: true,
        image: '',
        selectImage: '',
        gifImage: 'https://ipfs.unbrid.com/app/eternus.gif'
      }
    };

    return characterMap[text] || null;
  }
}
