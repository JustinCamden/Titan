<script>
   import localize from '~/helpers/utility-functions/Localize.js';
   import {getContext} from 'svelte';
   import tooltipAction from '~/helpers/svelte-actions/TooltipAction.js';
   import DocumentIntegerInput from '~/document/svelte-components/input/DocumentIntegerInput.svelte';
   import ModifiedValueLabel from '~/helpers/svelte-components/label/ModifiedValueLabel.svelte';
   import CharacterSheetResistanceCheckButton
      from '~/document/types/actor/types/character/sheet/header/CharacterSheetResistanceCheckButton.svelte';

   // The key / name of the resistance
   export let resistance;

   /** @type object Reference to the Document store. */
   const document = getContext('document');

   // Calculate the tooltipAction for the total value
   /**
    * @param baseValue
    * @param equipment
    * @param effect
    * @param ability
    * @param staticMod
    */
   function getTotalValueTooltip(
      baseValue,
      equipment,
      effect,
      ability,
      staticMod,
   ) {
      // Base label
      let retVal = `<p>${localize(`${resistance}.baseValue`)}</p><p>${localize(
         'base',
      )}: ${baseValue}</p>`;

      // Equipment
      if (equipment !== 0) {
         retVal += `<p>${localize('equipment')}: ${equipment}</p>`;
      }

      // Abilities
      if (ability !== 0) {
         retVal += `<p>${localize('abilities')}: ${ability}</p>`;
      }

      // Effects
      if (effect !== 0) {
         retVal += `<p>${localize('effects')}: ${effect}</p>`;
      }

      // Static mod
      if (staticMod !== 0) {
         retVal += `<p>${localize('mod')}: ${staticMod}</p>`;
      }

      return retVal;
   }

   $: totalValueTooltip = getTotalValueTooltip(
      $document.system.resistance[resistance].baseValue,
      $document.system.resistance[resistance].mod.equipment,
      $document.system.resistance[resistance].mod.effect,
      $document.system.resistance[resistance].mod.ability,
      $document.system.resistance[resistance].mod.static,
   );
</script>

<div class="stat" data-resistance={resistance}>
   <!--Resistance Label-->
   <div class="button {resistance}" use:tooltipAction="{localize(`${resistance}.desc`)}">
      <CharacterSheetResistanceCheckButton {resistance}></CharacterSheetResistanceCheckButton>
   </div>

   <!--Stats-->
   <div class="stats">
      <!--Base Value-->
      <div class="base-value">
         {$document.system.resistance[resistance].baseValue}
      </div>
      <div class="label">+</div>

      <!--Static Mod-->
      <div class="input">
         <DocumentIntegerInput
            bind:value={$document.system.resistance[resistance].mod.static}
         />
      </div>
      <div class="label">=</div>

      <!--Total Value-->
      <div class="value" use:tooltipAction="{totalValueTooltip}">
         <ModifiedValueLabel
            baseValue={$document.system.resistance[resistance].baseValue +
               $document.system.resistance[resistance].mod.equipment +
               $document.system.resistance[resistance].mod.ability}
            currentValue={$document.system.resistance[resistance].value}
         />
      </div>
   </div>
</div>

<style lang="scss">
   .stat {
      @include flex-row;
      @include flex-space-evenly;

      height: 100%;
      width: 100%;

      .button {
         width: 100%;
      }

      .stats {
         @include flex-row;
         @include flex-group-center;

         height: 100%;
         margin-left: var(--titan-padding-standard);

         :not(:first-child) {
            margin-left: var(--titan-padding-standard);
         }

         .input {
            @include flex-row;
            @include flex-group-center;

            height: 100%;
            width: 28px;
         }

         .base-value {
            @include flex-row;
            @include flex-group-center;
            @include label;

            height: var(--titan-input-height);
            width: 28px;
         }

         .label {
            @include flex-row;
            @include flex-group-center;

            height: 100%;
         }

         .value {
            @include flex-row;
            @include flex-group-center;

            height: 100%;
            min-width: 28px;
         }
      }
   }
</style>
