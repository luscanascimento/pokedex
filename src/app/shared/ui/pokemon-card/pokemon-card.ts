import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonSummary } from '../../../core/models/pokemon.model';
import { TypeBadge } from '../type-badge/type-badge';
import { SpriteImage } from '../sprite-image/sprite-image';
import { DexNumberPipe } from '../../pipes/dex-number.pipe';
import { DisplayNamePipe } from '../../pipes/title-case-name.pipe';

@Component({
  selector: 'pa-pokemon-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TypeBadge, SpriteImage, DexNumberPipe, DisplayNamePipe],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss',
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonSummary>();
  readonly isFavorite = input<boolean>(false);
  readonly inTeam = input<boolean>(false);
  readonly favoriteToggle = output<number>();
  readonly teamToggle = output<number>();

  protected readonly primaryType = computed(() => this.pokemon().types[0] ?? 'normal');

  protected onFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggle.emit(this.pokemon().id);
  }

  protected onTeam(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.teamToggle.emit(this.pokemon().id);
  }
}
