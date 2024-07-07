<script>
   import {getContext} from 'svelte';
   import CharacterSheetRating from '~/document/types/actor/types/character/sheet/sidebar/CharacterSheetRating.svelte';
   import CharacterSheetRatingButton
      from '~/document/types/actor/types/character/sheet/sidebar/CharacterSheetRatingButton.svelte';
   import {INITIATIVE_ICON} from '~/system/Icons.js';

   /** @type object Reference to the Document store. */
   const document = getContext('document');
</script>

<div class="ratings">
   <!--Initiative-->
   <div class="rating">
      <CharacterSheetRatingButton
         icon={INITIATIVE_ICON}
         key={'initiative'}
         onClick={() => {
            $document.requestInitiativeRoll();
         }}
      />
   </div>

   <!--Awareness-->
   <div class="rating">
      <CharacterSheetRating rating={'awareness'}/>
   </div>

   <!--Defense-->
   <div class="rating">
      <CharacterSheetRating rating={'defense'}/>
   </div>

   <!--Melee-->
   <div class="rating">
      <CharacterSheetRating rating={'melee'}/>
   </div>

   <!--Accuracy-->
   <div class="rating">
      <CharacterSheetRating rating={'accuracy'}/>
   </div>
</div>

<style lang="scss">
   .ratings {
      @include flex-column;
      @include flex-group-top;

      width: 100%;
      height: 100%;

      .rating {
         @include flex-row;
         @include flex-group-center;

         width: 100%;

         &:not(:first-child) {
            @include border-top;

            margin-top: var(--titan-padding-standard);
            padding-top: var(--titan-padding-standard);
         }
      }
   }
</style>
