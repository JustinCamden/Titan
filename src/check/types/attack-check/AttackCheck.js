import { clamp } from '~/helpers/Utility';
import TitanCheck from '~/check/Check.js';
import calculateAttackCheckResults from './CalculateAttackCheckResults.js';

export default class TitanAttackCheck extends TitanCheck {
   _ensureValidConstruction(options) {
      // Check if actor roll data was provided
      if (!options?.actorRollData) {
         console.error(
            'TITAN | Attack Check failed during construction. No provided Actor Roll Data.'
         );
         return false;
      }

      // Check if the weapon is valid
      const weaponRollData = options.weaponRollData;
      if (!weaponRollData) {
         console.error(
            `TITAN | Attack Check failed during construction. No provided Weapon Roll Data.`
         );
         return false;
      }

      // Check if the attack is valid
      if (!weaponRollData.attack[options.attackIdx]) {
         console.error(
            `TITAN | Attack Check failed during construction. Invalid Attack IDX (${options.attackIdx}).`
         );
         return false;
      }

      return true;
   }

   _initializeParameters(options) {
      // Cache values for easy reference
      const actorRollData = options.actorRollData;
      const weaponRollData = options.weaponRollData;
      const targetRollData = options.targetRollData;
      const attackData = weaponRollData.attack[options.attackIdx];

      // Initialize base parameters
      const parameters = {
         attack: attackData,
         attackNotes: weaponRollData.attackNotes,
         img: weaponRollData.img,
         complexity: 1,
         diceMod: options?.diceMod ?? 0,
         trainingMod: options.trainingMod ?? 0,
         expertiseMod: options.expertiseMod ?? 0,
         doubleExpertise: options?.doubleExpertise ?? false,
         maximizeSuccesses: options?.maximizeSuccesses ?? false,
         extraSuccessOnCritical: options?.extraSuccessOnCritical ?? false,
         extraFailureOnCritical: options?.extraFailureOnCritical ?? false,
         weaponName: weaponRollData.name,
         type: options.type ?? attackData.type,
         damageMod: options.damageMod ?? actorRollData.mod.damage.value,
      };

      // Determine the skill training and expertise
      if (!options.skill || options.skill === 'none') {
         parameters.skill = attackData.skill;
      }
      else {
         parameters.skill = options.skill;
      }
      const skillData = actorRollData.skill[parameters.skill];
      parameters.skillTrainingDice = skillData.training.value;
      parameters.skillExpertise = skillData.expertise.value;

      // Determine the attribute dice
      if (!options.attribute && options.attribute !== 'default') {
         parameters.attribute = attackData.attribute;
      }
      else {
         parameters.attribute = actorRollData.skill[parameters.skill].defaultAttribute;
      }
      parameters.attributeDice = actorRollData.attribute[parameters.attribute].value;

      // Determine whether this is a multi-attack
      if (options.multiAttack) {
         parameters.multiAttack = true;

         // Determine whether the attack has the multi attack trait
         for (let idx = 0; idx < attackData.trait.length; idx++) {
            if (attackData.trait[idx].name === 'multiAttack') {
               parameters.multiAttackTrait = true;
               break;
            }
         }
      }

      // Determine the target defense
      if (isNaN(options.targetDefense)) {
         if (targetRollData) {
            parameters.targetDefense = targetRollData.rating.defense.value;
         }
      }
      else {
         parameters.targetDefense = options.targetDefense;
      }

      // Calculate the difficulty if difficulty was not provided
      if (!options.difficulty) {
         // If the target is valid
         if (!isNaN(parameters.targetDefense)) {
            // Calculate the attacker rating
            parameters.attackerRating =
               parameters.type === 'melee' ?
                  (isNaN(options.attackerMelee) ? actorRollData.rating.melee.value : options.attackerMelee) :
                  (isNaN(options.attackerAccuracy) ? actorRollData.rating.accuracy.value : options.attackerAccuracy);

            // Difficulty = 4 + defense rating - attacker rating
            this.parameters.difficulty = clamp(this.parameters.targetDefense - parameters.attackerRating + 4, 2, 6);
         }
         else {
            this.parameters.difficulty = 4;
         }
      }
      else {
         parameters.difficulty = clamp(options.difficulty, 2, 6);
      }

      // Calculate the total training dice
      let totalTrainingDice = parameters.skillTrainingDice + parameters.trainingMod;
      if (parameters.doubleTraining) {
         totalTrainingDice *= 2;
      }

      // Add the training dice to the total dice
      parameters.totalDice = parameters.diceMod + parameters.attributeDice + totalTrainingDice;

      // Calculcate the total expertise
      let totalExpertise = parameters.skillExpertise + parameters.expertiseMod;
      if (parameters.doubleExpertise) {
         totalExpertise *= 2;
      }
      parameters.totalExpertise = totalExpertise;

      // Adjust the dice and expertise if this is a multi-attack
      if (parameters.multiAttack) {
         // Round the total dice up if this is a dual attack
         // Otherwise, round down
         parameters.totalDice = parameters.multiAttackTrait ?
            Math.ceil(parameters.totalDice / 2) :
            Math.floor(parameters.totalDice / 2);

         // Round the expertise down
         parameters.totalExpertise = Math.floor(parameters.totalExpertise / 2);
      }

      return parameters;
   }

   _calculateResults(inResults, parameters) {
      return calculateAttackCheckResults(inResults, parameters);
   }

   _getCheckType() {
      return 'attackCheck';
   }
}
