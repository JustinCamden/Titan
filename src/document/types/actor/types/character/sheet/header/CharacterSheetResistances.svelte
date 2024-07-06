<script>
   import {getContext} from 'svelte';
   import CharacterSheetResistance
      from '~/document/types/actor/types/character/sheet/header/CharacterSheetResistance.svelte';

   /** @type object Reference to the Document store. */
   const document = getContext('document');
</script>

<div class="stat-list">
   {#each Object.keys($document.system.resistance) as resistance}
      <div class="stat">
         <CharacterSheetResistance {resistance}/>
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
