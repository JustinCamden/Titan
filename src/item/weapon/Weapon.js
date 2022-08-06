import { TitanTypeComponent } from "./type-component.mjs";

export class TitanWeapon extends TitanTypeComponent {
   getChatTemplate() {
      return "systems/titan/templates/item/spell/spell-chat-message.hbs";
   }

   getAttackTemplate() {
      return {
         name: "Attack",
         type: "melee",
         range: "close",
         attribute: "body",
         skill: "meleeWeapons",
         damage: 1,
         plusSuccessDamage: true,
         traits: [],
      };
   }

   async addAttack() {
      // Create the new attack
      const newAttack = this.getAttackTemplate();

      // Add the attack and update the item
      let attack = this.parent.system.attack;
      attack.push(newAttack);
      await this.parent.update({
         system: {
            attack: attack,
         },
      });

      return;
   }

   async deleteAttack(idx) {
      // Remove the attack and update the item
      let attack = this.parent.system.attack;
      attack.splice(idx, 1);

      // If we have no more attacks, ensure we have at least one
      if (attack.length <= 0) {
         this.addAttack();

      }
      // Otherwise, update the item
      else {
         await this.parent.update({
            system: {
               attack: attack,
            },
         });
      }

      return;
   }

}