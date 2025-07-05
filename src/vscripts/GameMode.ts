import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);


        // 预加载粒子
        PrecacheResource("particle", "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf", context);
        // 预加载官方Skywrath音效脚本
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_skywrath_mage.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
        ListenToGameEvent("npc_spawned", event => this.OnNpcSpawned(event), undefined);

        // Register event listeners for events from the UI
        CustomGameEventManager.RegisterListener("ui_panel_closed", (_, data) => {
            print(`Player ${data.PlayerID} has closed their UI panel.`);

            // Respond by sending back an example event
            const player = PlayerResource.GetPlayer(data.PlayerID)!;
            CustomGameEventManager.Send_ServerToPlayer(player, "example_event", {
                myNumber: 42,
                myBoolean: true,
                myString: "Hello!",
                myArrayOfNumbers: [1.414, 2.718, 3.142]
            });

            // Also apply the panic modifier to the sending player's hero
            const hero = player.GetAssignedHero();
            if (hero != undefined) { // Hero didn't spawn yet or dead
                hero.AddNewModifier(hero, undefined, modifier_panic.name, { duration: 5 });
            }
        });
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);

        GameRules.SetHeroSelectionTime(10); // 选择英雄阶段的持续时间
        GameRules.SetShowcaseTime(8); // 选完英雄的展示时间
        GameRules.SetPreGameTime(5); // 进入游戏后号角吹响前的准备时间

        GameRules.SetShowcaseTime(0);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            for (let i = 0; i < 4; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
            }
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(3, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");

        // Do some stuff here
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        // After a hero unit spawns, apply modifier_panic for 8 seconds
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // Give all real heroes (not illusions) the meepo_earthbind_ts_example spell
        if (unit.IsRealHero()) {
            Timers.CreateTimer(3, () => {
                if (!unit.HasAbility("meepo_earthbind_ts_example")) {
                    // Add lua ability to the unit
                    unit.AddAbility("meepo_earthbind_ts_example");
                }
                if (!unit.HasAbility("typescript_skywrath_mage_arcane_bolt")) {
                    // Add lua ability to the unit
                    unit.AddAbility("typescript_skywrath_mage_arcane_bolt");
                }

                unit.HeroLevelUp(true);
                unit.HeroLevelUp(true);
            })
        }
    }
}
