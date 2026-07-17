import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PokemonTypeName } from '../../../core/models/pokemon.model';
import { MatchupService } from '../../../core/services/matchup.service';
import { TypeBadge } from '../type-badge/type-badge';

/**
 * Renders a full offensive + defensive effectiveness breakdown for a set
 * of types. Used by both the detail page and the Matchup Lab.
 */
@Component({
  selector: 'pa-effectiveness-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge],
  templateUrl: './effectiveness-panel.html',
  styleUrl: './effectiveness-panel.scss',
})
export class EffectivenessPanel {
  private readonly matchup = inject(MatchupService);
  readonly types = input.required<PokemonTypeName[]>();

  protected defensive() {
    return this.matchup.defensiveProfile(this.types());
  }

  protected offensive() {
    return this.matchup.offensiveProfile(this.types());
  }

  protected formatMultiplier(value: number): string {
    // Show ½× and ¼× fractions cleanly, integers as-is.
    if (value === 0.5) {
      return '½×';
    }
    if (value === 0.25) {
      return '¼×';
    }
    return `${value}×`;
  }
}
