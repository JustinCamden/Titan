import {writable} from 'svelte/store';
import localize from '~/helpers/utility-functions/Localize.js';
import TitanDialog from '~/helpers/dialogs/Dialog.js';
import CheckDialogShell from '~/check/dialog/CheckDialogShell.svelte';
import AttackCheckDialogShell from '~/check/types/attack-check/dialog/AttackCheckDialogShell.svelte';

/**
 * Creates a dialog window for setting the Options of an Attack Check.
 * @param {AttackCheckOptions} checkOptions - The initial options for the check to be adjusted.
 * @param {AttackCheckParameters} checkParameters - The initial parameters for the check,
 * calculated from the options.
 * @param {TitanActor} actor - The Actor that will roll the check.
 * @augments TitanDialog
 */
export default class AttackCheckDialog extends TitanDialog {

   /**
    * Creates a dialog window for setting the Options of an Attack Check.
    * @param {AttackCheckOptions} checkOptions - The initial options for the check to be adjusted.
    * @param {AttackCheckParameters} checkParameters - The initial parameters for the check,
    * calculated from the options.
    * @param {TitanActor} actor - The Actor that will roll the check.
    * @augments TitanDialog
    */
   constructor(checkOptions, checkParameters, actor) {
      super({
         title: `${localize('attackCheck')} (${actor.name})`,
         content: {
            class: CheckDialogShell,
            props: {
               shell: AttackCheckDialogShell,
               actor: actor,
               checkOptions: writable(checkOptions),
               checkParameters: writable(checkParameters),
            },
         },
         id: `titan-attack-check-dialog-${actor._id}`,
      });
   }

   _getDialogClasses() {
      const retVal = super._getDialogClasses();
      retVal.push('titan-check-dialog', 'titan-attack-check-dialog');

      return retVal;
   }
}
