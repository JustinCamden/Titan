<script>
   import localize from '~/helpers/utility-functions/Localize.js';
   import {getContext} from 'svelte';
   import tooltipAction from '~/helpers/svelte-actions/TooltipAction.js';
   import DocumentIntegerInput from '~/document/svelte-components/input/DocumentIntegerInput.svelte';
   import ModifiableStatValueLabel from '~/helpers/svelte-components/label/ModifiableStatValueLabel.svelte';
   import {getIcon} from '~/system/Icons.js';

   /** @type string The Rating that this component represents. */
   export let rating = void 0;

   /** @type string The Icon that represents this stat. */
   const icon = getIcon(rating);

   /** @type object Reference to the Document store. */
   const document = getContext('document');

</script>

<div class="stat">
   <!--Label-->
   <div class="sign" use:tooltipAction="{localize(`${rating}.desc`)}">
      <!--Icon-->
      <i class="{icon}"/>
      {localize(rating)}
   </div>

   <!--Stats-->
   <div class="stats">
      <!--Plus Sign-->
      <div class="sign">+</div>

      <!--Static Mod-->
      <div class="input">
         <DocumentIntegerInput
            bind:value={$document.system.rating[rating].mod.static}
         />
      </div>

      <!--Equal Sign-->
      <div class="sign">=</div>

      <!--Total Value-->
      <div class="value">
         <ModifiableStatValueLabel
            abilityMod={$document.system.rating[rating].mod.ability}
            baseValue={$document.system.rating[rating].baseValue}
            baseValueTooltip={localize(`${rating}.baseValue`)}
            effectMod={$document.system.rating[rating].mod.effect}
            equipmentMod={$document.system.rating[rating].mod.equipment}
            staticMod={$document.system.rating[rating].mod.static}
            value={$document.system.rating[rating].value}
         />
      </div>
   </div>
</div>

<style lang="scss">
   .stat {
      @include flex-row;
      @include flex-space-between;

      width: 100%;
      height: 100%;

      i {
         width: 20px;
      }

      .sign {
         @include flex-row;
         @include flex-group-center;

         height: 100%;

         .fas {
            margin-right: var(--titan-padding-standard);
         }
      }

      .stats {
         @include flex-row;
         @include flex-group-center;

         height: 100%;

         :not(:first-child) {
            margin-left: var(--titan-padding-standard);
         }

         .input {
            @include flex-row;
            @include flex-group-center;

            width: 28px;
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
