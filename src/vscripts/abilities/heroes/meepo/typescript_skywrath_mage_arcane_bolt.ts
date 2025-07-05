import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class typescript_skywrath_mage_arcane_bolt extends BaseAbility {
    // 音频
    sound_cast: string = "Hero_SkywrathMage.ArcaneBolt.Cast";
    sound_impact: string = "Hero_SkywrathMage.ArcaneBolt.Impact";
    // 粒子效果 particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf
    projectile_arcane_bolt: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf";

    Precache(context: CScriptPrecacheContext) {
        print('===========Precache');
        // 预加载粒子
        PrecacheResource("particle", this.projectile_arcane_bolt, context);

        // 预加载官方Skywrath音效脚本
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_skywrath_mage.vsndevts", context);
    }

    // 开始施法
    OnSpellStart() {
        print('==OnSpellStart2');
        const target = this.GetCursorTarget();
        print('==target', target)


        const bolt_speed = this.GetSpecialValueFor("bolt_speed");
        const bolt_vision = this.GetSpecialValueFor("bolt_vision");

        // 播放声音
        EmitSoundOn(this.sound_cast, this.GetCaster());

        // 创建弹道
        ProjectileManager.CreateTrackingProjectile({
            Ability: this,
            EffectName: this.projectile_arcane_bolt,
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
        print('==target',target)
        if (!target) return;

        EmitSoundOn(this.sound_impact, target);

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
