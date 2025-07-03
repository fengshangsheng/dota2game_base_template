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
            } else {
                // x
            }
        });
    }

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            for (let i = 0; i < 1; i++) {
                Tutorial.AddBot("npc_dota_hero_pudge", "", "", false);
            }
        }

        // todo: 策略时间
        if (state === GameState.STRATEGY_TIME) {
            for (let playerId = 0; playerId < DOTA_MAX_PLAYERS; playerId++) {
                print('===playerId', playerId)
                if (PlayerResource.IsValidPlayerID(playerId)) {
                    print(`===玩家 ${playerId} 已连接`);

                    // 获取玩家实体
                    const player = PlayerResource.GetPlayer(playerId);
                    print('===玩家实体 player', player);
                    const heroUnit = player?.GetAssignedHero()
                    if (player && heroUnit) {
                        print(`===玩家 ${playerId} 的英雄: ${heroUnit.GetUnitName()}`);
                    } else if (player) {
                        print(`===${playerId}没选择英雄，随机一个英雄`);

                        /**
                         * todo: 这里有个坑，在for循环中，如果不使用函数传参的方式传递playerId，会出现后面的playerId都是最后一个值的情况
                         * */
                        ((id) => {
                            PrecacheUnitByNameAsync('npc_dota_hero_lina', (context) => {
                                const hero = CreateHeroForPlayer('npc_dota_hero_lina', PlayerResource.GetPlayer(id)!)
                                if (!hero) {
                                    print(`===创建英雄失败: npc_dota_hero_lina`);
                                    return;
                                }

                                // 确保正确标记随机选择
                                PlayerResource.SetHasRandomed(id);
                                print(`===成功为玩家 ${id} 创建英雄: npc_dota_hero_lina`);
                            }, id)
                        })(playerId)
                    }
                }
            }
        }
        // if (state === GameState.CUSTOM_GAME_SETUP  ) {
        //     // Automatically skip setup in tools
        //     if (IsInToolsMode()) {
        //         Timers.CreateTimer(3, () => {
        //             GameRules.FinishCustomGameSetup();
        //         });
        //     }
        // }
        //
        // // Start game once pregame hits
        // if (state === GameState.PRE_GAME) {
        //     Timers.CreateTimer(0.2, () => this.StartGame());
        // }
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");

        // Do some stuff here
    }

    private configure(): void {
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);
        //
        GameRules.SetShowcaseTime(5);
        GameRules.SetHeroSelectionTime(10);
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        // After a hero unit spawns, apply modifier_panic for 8 seconds
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // Give all real heroes (not illusions) the meepo_earthbind_ts_example spell

        if (unit.IsRealHero()) {
            const heroName = unit.GetUnitName();
            if (!unit.HasAbility("meepo_earthbind_ts_example")) {
                // Add lua ability to the unit
                unit.AddAbility("meepo_earthbind_ts_example");
            }
        }
    }
}
