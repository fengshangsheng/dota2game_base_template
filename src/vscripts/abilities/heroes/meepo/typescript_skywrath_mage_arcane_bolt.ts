import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class typescript_skywrath_mage_arcane_bolt extends BaseAbility {


    // 开始施法
    OnSpellStart() {
        print('==OnSpellStart2');

        const target = this.GetCursorTarget();

        const bolt_speed = this.GetSpecialValueFor("bolt_speed");
        const bolt_vision = this.GetSpecialValueFor("bolt_vision");

        // 播放声音
        EmitSoundOn("Hero_SkywrathMage.ArcaneBolt.Cast", this.GetCaster());

        // 创建弹道
        ProjectileManager.CreateTrackingProjectile({
            Ability: this,
            EffectName: "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf",
            Source: this.GetCaster(),
            Target: target,
            bDodgeable: false,
            bProvidesVision: true,
            iMoveSpeed: bolt_speed,
            iVisionRadius: bolt_vision,
            iVisionTeamNumber: this.GetCaster().GetTeamNumber()
        })
    }

    // 弹道命中
    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector) {
        print('==target', target)
        if (!target) return;

        EmitSoundOn("Hero_SkywrathMage.ArcaneBolt.Impact", target);

        const bolt_vision = this.GetSpecialValueFor("bolt_vision");
        const bolt_damage = this.GetSpecialValueFor("bolt_damage");
        const int_multiplier = this.GetSpecialValueFor("int_multiplier");
        const vision_duration = this.GetSpecialValueFor("vision_duration");

        AddFOWViewer(this.GetCaster().GetTeamNumber(), location, bolt_vision, vision_duration, false);

        let damage = bolt_damage;
        if (this.GetCaster().IsHero()) {
            damage += (this.GetCaster() as CDOTA_BaseNPC_Hero).GetIntellect(false) * int_multiplier;
        }

        ApplyDamage({
            attacker: this.GetCaster(),
            damage: damage,
            damage_type: DamageTypes.MAGICAL,
            victim: target,
            ability: this,
            damage_flags: DamageFlag.NONE
        });
    }

}
