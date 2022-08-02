import TitanAttributeCheck from "../check/AttributeCheck.js";
import TitanSkillCheck from "../check/SkillCheck.js";
import TitanResistanceCheck from "../check/resistance-check/ResistanceCheck.js";
import TitanAttackCheck from "../check/AttackCheck.js";
import { TitanPlayerComponent } from "./player/Player.js";
import { TitanNPCComponent } from "./npc/NPC.js";
import { ResistanceCheckDialog } from "../check/resistance-check/dialog/ResistanceCheckDialog.js";
import TitanUtility from "../helpers/Utility.mjs";

export class TitanActor extends Actor {

  // Prepare calculated data
  prepareDerivedData() {
    // Prepare universal character data
    this._prepareCharacterData();

    // Create type component if necessary
    if (!this.system.typeComponent) {
      switch (this.type) {
        // Player
        case "player": {
          this.typeComponent = new TitanPlayerComponent(this);
          this.player = this.typeComponent;
          break;
        }

        // NPC
        case "npc": {
          this._prepareNpcData();
          this.typeComponent = new TitanNPCComponent(this);
          this.npc = this.typeComponent;
          break;
        }

        // Default is an error
        default: {
          console.error("TITAN: Invalid actor type when preparing derived data.");
          break;
        }
      }
    }

    // Prepare type specific data
    this.typeComponent.prepareDerivedData();

    return;
  }

  // Prepare Character type specific data
  _prepareCharacterData() {
    // Make modifications to data here. For example:
    const systemData = this.system;

    // Calculate ability mods
    for (let [k, v] of Object.entries(systemData.attribute)) {
      systemData.attribute[k].value = v.baseValue + v.staticMod;
    }

    // Calculate the total attribute value
    let totalBaseAttributeValue = 0;
    for (const attribute in systemData.attribute) {
      totalBaseAttributeValue += systemData.attribute[attribute].baseValue;
    }

    // Calculate skill mods
    for (let [k, v] of Object.entries(systemData.skill)) {
      systemData.skill[k].training.value =
        v.training.baseValue + v.training.staticMod;
      systemData.skill[k].expertise.value =
        v.expertise.baseValue + v.expertise.staticMod;
    }

    // Calculate speed mods
    for (let [k, v] of Object.entries(systemData.speed)) {
      systemData.speed[k].value = v.baseValue + v.staticMod;
    }

    // Calculate the base value of ratings
    // Initiative = (Mind + Perception + Dexterity) / 2 rounded up
    systemData.rating.initiative.baseValue =
      Math.ceil((systemData.attribute.mind.value +
        systemData.skill.perception.training.value +
        systemData.skill.dexterity.training.value) / 2);

    // Awareness = (Mind + Awareness) / 2 rounded up
    systemData.rating.awareness.baseValue =
      Math.ceil((systemData.attribute.mind.value +
        systemData.skill.perception.training.value) / 2);

    // Defense = (Body + Dexterity) / 2 rounded up
    systemData.rating.defense.baseValue =
      Math.ceil((systemData.attribute.body.value +
        systemData.skill.dexterity.training.value) / 2);

    // Accuracy = (Mind + Training in Ranged Weapons) / 2 rounded up
    systemData.rating.accuracy.baseValue =
      Math.ceil((systemData.attribute.mind.value,
        systemData.skill.rangedWeapons.training.value) / 2);

    // Melee = (Body + Training in Melee Weapons) / 2 rounded up (+ Mod)
    systemData.rating.melee.baseValue =
      Math.ceil((systemData.attribute.body.value +
        systemData.skill.meleeWeapons.training.value) / 2);

    // Calculate rating mods
    for (let [k, v] of Object.entries(systemData.rating)) {
      systemData.rating[k].value = v.baseValue + v.staticMod;
    }

    // Calculate resistance base values
    // Reflexeses = (Mind + (Body / 2) rounded up)
    systemData.resistance.reflexes.baseValue =
      systemData.attribute.mind.value +
      Math.ceil(systemData.attribute.body.value / 2);

    // Resilience = (Body + (Soul/2) rounded up)
    systemData.resistance.resilience.baseValue =
      systemData.attribute.body.value +
      Math.ceil(systemData.attribute.soul.value / 2);

    // Willpower = (Soul + (Mind/2))
    systemData.resistance.willpower.baseValue =
      systemData.attribute.soul.value +
      Math.ceil(systemData.attribute.mind.value / 2);

    // Calculate resistance mods
    for (let [k, v] of Object.entries(systemData.resistance)) {
      systemData.resistance[k].value = v.baseValue + v.staticMod;
    }

    // Calculate base resource values
    // Stamina = Total Attribute Mod
    systemData.resource.stamina.maxBase = Math.ceil(totalBaseAttributeValue *
      CONFIG.TITAN.constants.resource.stamina.maxBaseMulti);

    // Resolve = Soul / 2 rounded up
    systemData.resource.resolve.maxBase = Math.ceil(
      systemData.attribute.soul.value * CONFIG.TITAN.constants.resource.resolve.maxBaseMulti);

    // Wounds = Total Attribute mod / 2 rounded up
    systemData.resource.wounds.maxBase = Math.ceil(
      totalBaseAttributeValue * CONFIG.TITAN.constants.resource.wounds.maxBaseMulti);

    // Calculate resource mods and clamp them to be within range
    for (let [k, v] of Object.entries(systemData.resource)) {
      systemData.resource[k].maxValue =
        v.maxBase + v.staticMod;
      systemData.resource[k].value =
        TitanUtility.clamp(systemData.resource[k].value, 0, systemData.resource[k].maxValue);
    }

    // Calculate mods
    for (let [k, v] of Object.entries(systemData.mod)) {
      systemData.mod[k].value = v.baseValue + v.staticMod;
    }

    // Calculate effects
    // Add armor from the equipped armor if appropriate
    const armorId = this.system.equipped.armor;
    if (armorId) {
      const armor = this.items.get(armorId);
      if (armor) {
        systemData.mod.armor.value += armor.system.armor;
      }
    }

    return;
  }

  // Get the initiative check
  async getInitiativeRoll(options) {
    // Calculate the initiative value
    const initiative = this.system.rating.initiative.value;

    // Get the initiative formula
    let initiativeFormula = "";
    const initiativeSettings = game.settings.get("titan", "initiativeFormula");
    if (initiativeSettings === "roll2d6") {
      initiativeFormula = "2d6+";
    }
    else if (initiativeSettings === "roll1d6") {
      initiativeFormula = "1d6+";
    }

    const roll = new Roll(
      initiativeFormula +
      initiative.toString() +
      (options !== undefined && options.bonus !== undefined ?
        options.bonus.toString() : "")
    );
    const retVal = {
      outRoll: roll,
      outInitiativeMod: initiative,
    };

    return retVal;
  }

  // Get a skill check from the actor
  async getSkillCheck(options) {
    // Initialize options
    let checkOptions = options;

    // Check if the attribute set to default
    if (checkOptions.attribute === "default") {
      // If so, ensure the attribute is set
      checkOptions.attribute =
        this.system.skill[checkOptions.skill].defaultAttribute;
    }

    // Get the options from a dialog if appropriate
    if (options?.getOptions) {
      checkOptions = await TitanSkillCheck.getOptionsFromDialog(checkOptions);

      // Return if cancelled
      if (checkOptions.cancelled) {
        return;
      }
    }

    // Get the actor check data
    const actorCheckData = this.getCheckData();
    checkOptions.actorCheckData = actorCheckData;

    // Check if the skill is none
    if (checkOptions.skill === "none") {
      // If so, do an attribute check
      delete checkOptions.skill;
      delete checkOptions.trainingMod;
      const attributeCheck = new TitanAttributeCheck(checkOptions);
      return attributeCheck;
    }

    // Otherwise, do a skill check
    const skillCheck = new TitanSkillCheck(checkOptions);
    return skillCheck;
  }

  // Get a resistance check at the actor
  async getResistanceCheck(options) {

    // Get a check from the actor
    const checkOptions = options;

    // Get the actor check data
    const actorCheckData = this.getCheckData();
    checkOptions.actorCheckData = actorCheckData;

    // Perform the roll
    const resistanceCheck = new TitanResistanceCheck(checkOptions);

    // Return the data
    return resistanceCheck;
  }

  async rollResistanceCheck(options) {
    // If get options, then create a dialog for setting options.
    const getOptions = options?.getOptions;
    if (getOptions === true) {
      const dialog = new ResistanceCheckDialog(this, options);
      dialog.render(true);
      return;
    }

    // Otherwise, get a simple check
    const resistanceCheck = await this.getResistanceCheck(options);
    if (resistanceCheck && resistanceCheck.isValid) {
      await resistanceCheck.evaluateCheck();
      await resistanceCheck.sendToChat({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: this }),
        rollMode: game.settings.get("core", "rollMode"),
      });
    }

    return;
  }

  // Get an attack check
  async getAttackCheck(options) {
    // Get the weapon check data.
    const checkWeapon = this.items.get(options?.itemId);
    if (!checkWeapon) {
      console.error(
        "TITAN | Attack check failed. Invalid weapon ID provided to actor"
      );

      return false;
    }

    // Initialize check options
    let checkOptions = options;
    checkOptions.damageMod = options.damageMod ?? this.system.mod.damage.value;

    // Get the options from a dialog if appropriate
    if (options.getOptions) {
      checkOptions = await TitanAttackCheck.getOptionsFromDialog(checkOptions);

      // Return if cancelled
      if (checkOptions.cancelled) {
        return;
      }
    }

    // Add the actor check data to the check options
    const actorCheckData = this.getCheckData();
    checkOptions.actorCheckData = actorCheckData;

    // Add the weapon data to the check options
    const weaponCheckData = checkWeapon.getCheckData();
    checkOptions.weaponCheckData = weaponCheckData;
    checkOptions.weaponName = checkWeapon.name;

    // Get the target check data
    let userTargets = Array.from(game.user.targets);
    if (userTargets.length < 1 && game.user.isGM) {
      userTargets = Array.from(canvas.tokens.controlled);
    }
    if (userTargets[0]) {
      const targetCheckData = userTargets[0].document.actor.getCheckData();
      checkOptions.targetCheckData = targetCheckData;
    }

    // Perform the attack
    const attackCheck = new TitanAttackCheck(checkOptions);
    return attackCheck;
  }

  // Get the check data 
  getCheckData() {
    const checkData = this.system;
    return checkData;
  }

  // Apply damage to the actor
  async applyDamage(damageData) {
    // Calculate the damage amount
    const baseDamage = damageData.damage;
    let damage = baseDamage;
    if (!damageData.ignoreArmor) {
      damage = Math.max(damage - this.system.mod.armor.value, 0);
    }
    const newStamina = this.system.resource.stamina.value - damage;

    // Prepare the update data
    const updateData = {
      system: {
        resource: {
          stamina: {
            value: Math.max(newStamina, 0),
          },
          wounds: {
            value: this.system.resource.wounds.value,
          },
        },
      },
    };

    // If the stamina was dropped below 0
    if (newStamina < 0) {
      // Calculate wounds
      const oldWounds = this.system.resource.wounds.value;

      if (newStamina < -1) {
        if (newStamina < -3) {
          // 3 Wounds
          updateData.system.resource.wounds.value += 3;
        }
        else {
          // 2 Wounds
          updateData.system.resource.wounds.value += 2;
        }
      }
      else {
        // 1 Wound
        updateData.system.resource.wounds.value += 1;
      }
    }

    // Update the amount of stamin
    await this.update(updateData);

    // Create the damage report message
    const messageData = {
      baseDamage: baseDamage,
      damage: damage,
      ignoreArmor: damageData.ignoreArmor ?? null,
      armor: this.system.mod.armor.value,
      stamina: this.system.resource.stamina,
      wounds: this.system.resource.wounds,
    };
    const messageContent = await renderTemplate(
      "/systems/titan/templates/chat-message/damage-report-chat-message.hbs",
      messageData
    );

    // Send the damage report to chat
    const messageClass = getDocumentClass("ChatMessage");
    await messageClass.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: messageContent,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      whisper: game.users.filter((user) =>
        this.testUserPermission(user, "OWNER")
      ),
    });

    return;
  }

  equipArmor(armorId) {
    // Ensure the armor is valid
    const armor = this.items.get(armorId);
    if (!armor && armor.type === "armor") {
      console.error("TITAN | Error equipping Armor. Invalid Armor ID.");
    }

    // Update the armor
    let equippedArmor = this.system.equipped.armor;
    equippedArmor = armorId;
    this.update({
      system: {
        equipped: {
          armor: equippedArmor,
        },
      },
    });

    return;
  }

  unEquipArmor() {
    // Remove the armor
    let equippedArmor = this.system.equipped.armor;
    equippedArmor = null;
    this.update({
      system: {
        equipped: {
          armor: equippedArmor,
        },
      },
    });

    return;
  }

  deleteItem(itemId) {
    // Ensure the item is valid
    const item = this.items.get(itemId);
    if (!item) {
      return false;
    }

    // Remove the armor if appropriate
    const armorId = this.system.equipped.armor;
    if (armorId === itemId) {
      this.unEquipArmor();
    }

    // Delete the item
    item.delete();

    return;
  }
}
