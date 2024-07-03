<script>
   import localize from '~/helpers/utility-functions/Localize.js';
   import {getContext} from 'svelte';
   import DocumentIntegerInput from '~/document/svelte-components/input/DocumentIntegerInput.svelte';
   import DocumentOwnerAttributeButton from '~/document/svelte-components/DocumentOwnerAttributeButton.svelte';
   import ModifiableStatValueLabel from '~/helpers/svelte-components/label/ModifiableStatValueLabel.svelte';

   /** @type string The Attribute that this component represents. */
   export let attribute;

   /** @type object Reference to the Document store. */
   const document = getContext('document');

   /**
    * Rolls the Attribute from the character.
    */
   function onRoll() {
      $document.system.requestAttributeCheck({attribute: attribute});
   }
</script>

<div class="attribute" data-attribute={attribute}>
   <!--Label Button-->
   <div class="button">
      <DocumentOwnerAttributeButton {attribute} on:click={onRoll} tooltip={localize(`${attribute}.desc`)}>
         {localize(attribute)}
      </DocumentOwnerAttributeButton>
   </div>

   <!--Stats-->
   <div class="stats">

      <!--Base Value-->
      <div class="input">
         <DocumentIntegerInput
            bind:value={$document.system.attribute[attribute].baseValue}
         />
      </div>

      <!--Plus Sign-->
      <div class="label">+</div>

      <!--Static Mod-->
      <div class="input">
         <DocumentIntegerInput
            bind:value={$document.system.attribute[attribute].mod.static}
         />
      </div>

      <!--Equal Sign-->
      <div class="label">=</div>

      <!--Total Value-->
      <div class="value">
         <ModifiableStatValueLabel
            abilityMod={$document.system.attribute[attribute].mod.ability}
            baseValue={$document.system.attribute[attribute].baseValue}
            effectMod={$document.system.attribute[attribute].mod.effect}
            equipmentMod={$document.system.attribute[attribute].mod.equipment}
            staticMod={$document.system.attribute[attribute].mod.static}
            value={$document.system.attribute[attribute].value}
         />
      </div>
   </div>
</div>

<style lang="scss">
   .attribute {
      @include flex-row;
      @include flex-space-evenly;

      height: 100%;
      width: 100%;

      .button {
         min-width: 96px;
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
