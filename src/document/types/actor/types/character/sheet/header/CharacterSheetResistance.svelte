<script>
   import localize from '~/helpers/utility-functions/Localize.js';
   import {getContext} from 'svelte';
   import tooltipAction from '~/helpers/svelte-actions/TooltipAction.js';
   import DocumentIntegerInput from '~/document/svelte-components/input/DocumentIntegerInput.svelte';
   import CharacterSheetResistanceCheckButton
      from '~/document/types/actor/types/character/sheet/header/CharacterSheetResistanceCheckButton.svelte';
   import ModifiableStatValueLabel from '~/helpers/svelte-components/label/ModifiableStatValueLabel.svelte';

   /** @type string The Resistance that this component represents. */
   export let resistance;

   /** @type object Reference to the Document store. */
   const document = getContext('document');
</script>

<div class="container" data-resistance={resistance}>
   <!--Resistance Label-->
   <div class="button {resistance}" use:tooltipAction="{localize(`${resistance}.desc`)}">
      <CharacterSheetResistanceCheckButton {resistance}/>
   </div>

   <!--Stats-->
   <div class="stats">

      <!--Base Value-->
      <div class="base-value">
         {$document.system.resistance[resistance].baseValue}
      </div>

      <!--Plus Sign-->
      <div class="sign">+</div>

      <!--Static Mod-->
      <div class="input">
         <DocumentIntegerInput
            bind:value={$document.system.resistance[resistance].mod.static}
         />
      </div>

      <!--Equal Sign-->
      <div class="sign">=</div>

      <!--Total Value-->
      <div class="value">
         <ModifiableStatValueLabel
            abilityMod={$document.system.resistance[resistance].mod.ability}
            baseTooltip={localize(`${resistance}.baseValue`)}
            baseValue={$document.system.resistance[resistance].baseValue}
            effectMod={$document.system.resistance[resistance].mod.effect}
            equipmentMod={$document.system.resistance[resistance].mod.equipment}
            staticMod={$document.system.resistance[resistance].mod.static}
            value={$document.system.resistance[resistance].value}
         />
      </div>
   </div>
</div>

<style lang="scss">
   .container {
      @include flex-row;
      @include flex-space-evenly;

      width: 100%;

      .button {
         width: 100%;
      }

      .stats {
         @include flex-row;
         @include flex-group-center;

         height: 100%;
         margin-left: var(--titan-padding-large);

         :not(:first-child) {
            margin-left: var(--titan-padding-standard);
         }

         .input {
            @include flex-row;
            @include flex-group-center;

            height: 100%;
            width: 28px;
         }

         .sign {
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
