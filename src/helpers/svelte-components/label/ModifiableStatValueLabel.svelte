<script>
   import localize from '~/helpers/utility-functions/Localize.js';
   import tooltipAction from '~/helpers/svelte-actions/TooltipAction.js';

   /** @type number The base value of the stat before any modifiers are applied. */
   export let baseValue = void 0;

   /** @type number The value of the stat after any modifiers are applied. */
   export let value = void 0;

   /** @type number Bonuses and penalties from Abilities. */
   export let abilityMod = void 0;

   /** @type number Bonuses and penalties from Effects. */
   export let effectMod = void 0;

   /** @type number Bonuses and penalties from Equipment. */
   export let equipmentMod = void 0;

   /** @type number Bonuses and penalties from Static modifiers. */
   export let staticMod = void 0;

   /** @type string Label for the base value of the stat in the tooltip. */
   export let baseValueTooltip = void 0;

   /** @type number Calculated sum bonuses and penalties from additional modifiers. */
   let extraMod = 0;

   /** @type string Calculated tooltip for the stat. */
   let tooltip = `<p>${baseValueTooltip ?? localize('base')}: ${baseValue}</p>`;

   /** @type string Calculated class to use for styling the label. */
   let styleClass = 'label';

   $: {
      // Calculate the normal value by adding the ability and equipment mods to the base value.
      let normalBaseValue = baseValue;
      if (abilityMod) {
         normalBaseValue += abilityMod;
      }
      if (equipmentMod) {
         normalBaseValue += equipmentMod;
      }

      // Calculate the extra mod by checking the difference between the normal total value and actual value.
      extraMod = 0;
      let normalValue = normalBaseValue;
      if (effectMod) {
         normalValue += effectMod;
      }
      if (staticMod) {
         normalValue += staticMod;
      }
      if (normalValue !== value) {
         extraMod = value - normalValue;
         normalBaseValue += extraMod;
      }

      // Update the style class in response to changes.
      styleClass = 'label';

      // Add a bonus class if normal value < current value.
      if (normalBaseValue < value) {
         styleClass += ' bonus';
      }

      // Add a penalty class if normal value > current value.
      else if (normalBaseValue > value) {
         styleClass += ' penalty';
      }

      // Update the tooltip in response to changes.
      tooltip = `<p>${baseValueTooltip ?? localize('base')}: ${baseValue}</p>`;

      // Add Ability mod tooltip.
      if (abilityMod) {
         tooltip += `<p>${localize('abilities')}: ${abilityMod}</p>`;
      }

      // Add Effect mod tooltip.
      if (effectMod) {
         tooltip += `<p>${localize('effects')}: ${effectMod}</p>`;
      }

      // Add Equipment mod tooltip.
      if (equipmentMod) {
         tooltip += `<p>${localize('equipment')}: ${equipmentMod}</p>`;
      }

      // Add Static mod tooltip.
      if (staticMod) {
         tooltip += `<p>${localize('static')}: ${staticMod}</p>`;
      }

      // Add Extra mod tooltip.
      if (extraMod) {
         tooltip += `<p>${localize('otherModifiers')}: ${extraMod}</p>`;
      }
   }
</script>

<!--Total Value-->
<div class={styleClass} use:tooltipAction={tooltip}>
   {value}
</div>

<style lang="scss">
   .label {
      @include label;

      --titan-label-height: var(--titan-input-height);
      --titan-label-padding: var(--titan-input-padding);

      &.bonus {
         --titan-label-color: var(--titan-greater-color);
         --titan-label-background: var(--titan-greater-background);
      }

      &.penalty {
         --titan-label-color: var(--titan-lesser-color);
         --titan-label-background: var(--titan-lesser-background);
      }
   }
</style>
