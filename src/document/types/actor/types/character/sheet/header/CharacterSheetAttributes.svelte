<script>
   import {getContext} from 'svelte';
   import CharacterSheetAttribute
      from '~/document/types/actor/types/character/sheet/header/CharacterSheetAttribute.svelte';

   /** @type object Reference to the Document store. */
   const document = getContext('document');
</script>

<!-- Resistances-->
<div class="stat-list">

   <!-- Each Resistance-->
   {#each Object.keys($document.system.attribute) as attribute}
      <div class="stat">
         <CharacterSheetAttribute {attribute}/>
      </div>
   {/each}
</div>

<style lang="scss">
   .stat-list {
      @include flex-column;
      @include flex-group-top;

      width: 100%;

      .stat {
         @include flex-row;
         @include flex-group-center;

         width: 100%;

         &:not(:first-child) {
            @include border-top;

            padding-top: var(--titan-padding-standard);
            margin-top: var(--titan-padding-standard);
         }
      }
   }
</style>
