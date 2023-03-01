import { getFlatModifierTemplate } from '~/rules-element/FlatModifier.js';
import { getMulBaseTemplate } from '~/rules-element/MulBase.js';
import { getFastHealingTemplate } from '~/rules-element/FastHealing.js';
import { getPersistentDamageTemplate } from '~/rules-element/PersistentDamage';
import { getTurnMessageTemplate } from '~/rules-element/TurnMessage';
import { getRollMessageTemplate } from '~/rules-element/RollMessage';
import { getConditionalDiceModifierTemplate } from '~/rules-element/ConditionalDiceModifier';
import { getConditionalRatingModifierTemplate } from '~/rules-element/ConditionalRatingModifier';

export default async function onRulesElementOperationChanged(document, elementIdx) {
   const element = document.system.rulesElement[elementIdx];
   switch (element.operation) {
      case 'flatModifier': {
         document.system.rulesElement[elementIdx] = getFlatModifierTemplate(element.uuid, element.type);
         break;
      }
      case 'mulBase': {
         document.system.rulesElement[elementIdx] = getMulBaseTemplate(element.uuid, element.type);
         break;
      }
      case 'fastHealing': {
         document.system.rulesElement[elementIdx] = getFastHealingTemplate(element.uuid, element.type);
         break;
      }
      case 'persistentDamage': {
         document.system.rulesElement[elementIdx] = getPersistentDamageTemplate(element.uuid, element.type);
         break;
      }
      case 'turnMessage': {
         document.system.rulesElement[elementIdx] = getTurnMessageTemplate(element.uuid);
         break;
      }
      case 'rollMessage': {
         document.system.rulesElement[elementIdx] = getRollMessageTemplate(element.uuid);
         break;
      }
      case 'conditionalDiceModifier': {
         document.system.rulesElement[elementIdx] = getConditionalDiceModifierTemplate(element.uuid);
         break;
      }
      case 'conditionalRatingModifier': {
         document.system.rulesElement[elementIdx] = getConditionalRatingModifierTemplate(element.uuid);
         break;
      }
      default: {
         console.error(`TITAN: Invalid Rules Element operation ${element.operation}`);
         console.trace();
         return;
      }
   }

   return await document.update({
      system: {
         rulesElement: document.system.rulesElement
      }
   });
}