import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FierceGuardianCharacterComponent } from './shared/fierce-guardian-character/fierce-guardian-character.component';
import { InfiniteUpnRewardsComponent } from './shared/infinite-upn-rewards/infinite-upn-rewards.component';
import { Character } from './shared/models/character.model';

@Component({
  selector: 'app-premium-upgrade-dialog',
  templateUrl: './premium-upgrade-dialog.component.html',
  styleUrls: ['./premium-upgrade-dialog.component.scss'],
  imports: [CommonModule]
})
export class PremiumUpgradeDialogComponent {
  selectedPackage: any = null;

  packages = [
    {
      id: 'apprentice',
      name: 'APPRENTICE',
      price: 2,
      multiplier: 1
    },
    {
      id: 'guardian',
      name: 'GUARDIAN',
      price: 10,
      multiplier: 5
    },
    {
      id: 'sage',
      name: 'SAGE',
      price: 20,
      multiplier: 10
    },
    {
      id: 'mystic',
      name: 'MYSTIC',
      price: 50,
      multiplier: 25
    },
    {
      id: 'alchemist',
      name: 'ALCHEMIST',
      price: 100,
      multiplier: 50
    }
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {
    this.selectedPackage = this.packages[2]; // SAGE package selected by default
  }

  closeDialog() {
    this.activeModal.close();
  }

  selectPackage(pkg: any) {
    this.selectedPackage = pkg;
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

  openInfiniteUpnRewardsModal() {
    const modalRef = this.modalService.open(InfiniteUpnRewardsComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true
    });
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
