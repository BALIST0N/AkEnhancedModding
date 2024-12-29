"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

class AkSplitterMod 
{   
    preSptLoad(container)
    {
        let removedAks = 
        [
            "59d6088586f774275f37482f", //akm
            "59ff346386f77477562ff5e2", //akms
            "5bf3e03b0db834001d2c4a9c", //ak74
            "5bf3e0490db83400196199af", //aks-74
            "57dc2fa62459775949412633", //aks-74u
            "5839a40f24597726f856b511", //aks-74ub

            "5ac66d015acfc400180ae6e4", //ak-102
            "5ac66d725acfc43b321d4b60", //ak-104
            "5ac66d9b5acfc4001633997a"  //ak-105
        ]

        container.resolve("ConfigServer").getConfig("spt-ragfair").dynamic.blacklist.custom.push( removedAks );

        container.resolve("ConfigServer").getConfig("spt-bot").equipment.pmc.blacklist[0].equipment["FirstPrimaryWeapon"] = removedAks;

        delete container.resolve("ConfigServer").getConfig("spt-bot").equipment.pmc.weightingAdjustmentsByBotLevel[0].equipment.edit.FirstPrimaryWeapon["59d6088586f774275f37482f"]

    }
    
    postDBLoad(container)
    {
        const hashUtil = container.resolve("HashUtil");
        const itemHelper = container.resolve("ItemHelper");
        const containerTables = container.resolve("DatabaseServer").getTables();

        const items = containerTables.templates.items;
        const handbook = containerTables.templates.handbook.Items;
        const locales = containerTables.locales.global;
        const traders = containerTables.traders;
        const quests = containerTables.templates.quests;
        const repetablesQuests = containerTables.templates.repeatableQuests;
        const globalsPresets = containerTables.globals["ItemPresets"];
        const bots = containerTables.bots.types;
        const profiles = containerTables.templates.profiles;
        const productions = containerTables.hideout.production;
        const locations = containerTables.locations
        //const staticLoot = containerTables.loot.staticLoot
        

        /*************************************  DATA  ********************************************/
        const fs = require('fs');

        let mod_handguard_slot = require("./db/slot_mod.json");
        var regex = new RegExp("^[a-fA-F0-9]{24}$"); //regex to test mongoID

        const excludedWeaponToFix = //weapons who doesn't need new barrels
        [
            "628a60ae6b1d481ff772e9c8", //RD-704
            "57dc2fa62459775949412633", //aks74U
            "583990e32459771419544dd2", //aks74UN
            "5839a40f24597726f856b511"  //aks-74UB
        ]

        const akWeaponFamillyIds = //akweapon familly who use standard sized gastubes
        [
            "5ac66cb05acfc40198510a10", //ak-101
            "5ac66d2e5acfc43b321d4b53", //ak-103
            "5ac4cd105acfc40016339859", //ak-74M
            "5ab8e9fcd8ce870019439434", //aks-74N
            "5644bd2b4bdc2d3b4c8b4572", //ak-74n
            "5a0ec13bfcdbcb00165aa685", //AKMN
            "5abcbc27d8ce8700182eceeb", //AKMSN
            "59e6152586f77473dc057aa1", //vepr-136
            "59e6687d86f77411d949b251", //vpo-209
        ]

        let aksToDelete = //these ak are merged
        {   
            "5ac66d015acfc400180ae6e4":"5ac66cb05acfc40198510a10",      //ak-102 -> ak-101
            "5ac66d725acfc43b321d4b60":"5ac66d2e5acfc43b321d4b53",      //ak-104 -> ak-103
            "5ac66d9b5acfc4001633997a":"5ac4cd105acfc40016339859",      //ak-105 -> AK-74M

            "59d6088586f774275f37482f":"5a0ec13bfcdbcb00165aa685",      //AKM -> AKMN
            "59ff346386f77477562ff5e2":"5abcbc27d8ce8700182eceeb",      //akms -> AKMSN
            "5bf3e03b0db834001d2c4a9c":"5644bd2b4bdc2d3b4c8b4572",      //ak74 -> ak74N
            "5bf3e0490db83400196199af":"5ab8e9fcd8ce870019439434",      //aks74 -> aks74N
            "57dc2fa62459775949412633":"583990e32459771419544dd2",      //aks74U -> aks74UN
            "5839a40f24597726f856b511":"583990e32459771419544dd2"       //aks74UB -> aks74UN
        }



        const otherAkFamilly = //these weapons have new bundles for having a mod_handguard slot (in the .bundle file)
        [
            "628a60ae6b1d481ff772e9c8",  //RD-704
            "59984ab886f7743e98271174",  //pp-19
            "59f9cabd86f7743a10721f46"  //saiga 9
        ]

        //since both array have akm familly values inside, we must concat and delete duplicates
        const entireAkFamily = [...new Set([...akWeaponFamillyIds, ...otherAkFamilly])];
        const entireAkFamily2 = [...new Set([...akWeaponFamillyIds, ...otherAkFamilly, ...Object.keys(aksToDelete)])];

        const gasblocks = //list of non railed gastubes
        [
            "5a01ad4786f77450561fda02",     //vdm cs custom cut
            "59c6633186f7740cf0493bb9",     //ak-74 gas tube
            "59d64ec286f774171d1e0a42",     //akm 6P1 gas tube
            "59e649f986f77411d949b246",     //molot gastube
            "59ccd11386f77428f24a488f"      //vityaz gas tube
        ];

        const separatedGasBlocks =
        [
            "5b237e425acfc4771e1be0b6", //troy 
            "5cf656f2d7f00c06585fb6eb", //vs33c
            "628a83c29179c324ed269508"  //slr ion 

        ];

        const newUpperHanguards = //splitted uppers handguards from standard types gastube handguards
        {
            "handguard_ak_caa_quad_rail_polymer_upper" : "67597e817ad45ed39b0fc153",
            "handguard_ak_izhmash_ak74_std_plum_upper":"67597e817ad45ed39b0fc155",
            "handguard_ak_khyber_swiss_grather_upper":"67597e817ad45ed39b0fc159",
            "handguard_ak_izhmash_ak74_std_wood_upper":"67597e817ad45ed39b0fc156",
            "handguard_ak_izhmash_ak74m_std_plastic_upper":"67597e817ad45ed39b0fc157",
            "handguard_ak_izhmash_akm_std_wood_upper":"67597e817ad45ed39b0fc158",
            "handguard_ak_molot_vepr_km_vpo_136_upper":"67597e817ad45ed39b0fc160",
            "handguard_ak_molot_vepr_km_vpo_209_upper":"67597e817ad45ed39b0fc161",
            "handguard_ak_magpul_moe_ak_blk_upper":"67597e817ad45ed39b0fc15b",
            "handguard_ak_magpul_moe_ak_fde_upper":"67597e817ad45ed39b0fc15c",
            "handguard_ak_magpul_moe_ak_od_upper":"67597e817ad45ed39b0fc15d",
            "handguard_ak_magpul_moe_ak_plm_upper":"67597e817ad45ed39b0fc15e",
            "handguard_ak_magpul_moe_ak_sg_upper":"67597e817ad45ed39b0fc15f"
        }

        const separatedSideMounts = 
        [
            "67597e817ad45ed39b0fc173", //"mount_siderail_RMP3", 
            "67597e817ad45ed39b0fc174", //"mount_siderail_RMP5", 
            "67597e817ad45ed39b0fc175"  //"mount_siderail_RMPM" 
        ]
        const separateBarrels = 
        [
            "67597e817ad45ed39b0fc16b", //"mod_barrel_11_inch_AK100",
            "67597e817ad45ed39b0fc16e", //"mod_barrel_15_inch_AK74",
            "67597e817ad45ed39b0fc171"  //"mod_barrel_15_inch_AKM"
        ]

        const linkLowerAndUpper = //hanguards with special uppers that don't use standard gasblock locking system
        {
            "5cf4e3f3d7f00c06595bc7f0": "67597e357ad45ed39b0fc14f", //"handguard_ak_545_design_red_heat_agressor_upper",
            "59fb375986f7741b681b81a6": "67597e817ad45ed39b0fc15a", //"handguard_ak_krebs_ufm_akm_long_upper",
            "5a9d56c8a2750c0032157146": "67597e817ad45ed39b0fc162", //"handguard_ak_strike_industries_trax_1_upper",
            "5f6331e097199b7db2128dc2": "67597e817ad45ed39b0fc163", //"handguard_ak_tdi_x47_upper",
            "5c17664f2e2216398b5a7e3c": "67597e817ad45ed39b0fc165", //"handguard_ak_vltor_cmrd_upper",
            "5648b4534bdc2d3d1c8b4580": "67597e817ad45ed39b0fc168", //"handguard_ak_zenit_b19_upper",
            "5efaf417aeb21837e749c7f2": "67597e817ad45ed39b0fc169", //"handguard_ak_zenit_b31_upper",
            "647dba3142c479dde701b654": "67597e817ad45ed39b0fc151", //"handguard_ak_akademia_dominator_upper",
            "647dd2b8a12ebf96c3031655": "67597e817ad45ed39b0fc152", //"handguard_ak_alfa_arms_aspid_upper",
            "6389f1dfc879ce63f72fc43e": "67597e817ad45ed39b0fc154"  //"handguard_ak_cnc_guns_ov_gp_upper"
        }

        const newLowersFromGastubes = 
        [
            "67597e817ad45ed39b0fc164", //"handguard_ak_troy_vent_hole_lower",
            "67597e817ad45ed39b0fc166", //"handguard_ak_vs_vs_33c_lower",
            "67597e817ad45ed39b0fc167", //"handguard_ak_vs_vs_33c_wht_lower",
            "67597e817ad45ed39b0fc16a"  //"handguard_slr_ion_lite_704"
        ]

        let lowerAndUppers = //matching separated lowers and uppers
        {            
            "handguard_ak_caa_quad_rail_polymer":             "67597e817ad45ed39b0fc153",  //"handguard_ak_caa_quad_rail_polymer_upper",
            "handguard_ak_izhmash_ak74_std_plum":             "67597e817ad45ed39b0fc155",  //"handguard_ak_izhmash_ak74_std_plum_upper",
            "handguard_ak_tdi_akm_l":                         "67597e817ad45ed39b0fc159",  //"handguard_ak_khyber_swiss_grather_upper",
            "handguard_ak_tdi_akm_l_gld":                     "67597e817ad45ed39b0fc159",  //"handguard_ak_khyber_swiss_grather_upper",
            "handguard_ak_tdi_akm_l_red":                     "67597e817ad45ed39b0fc159",  //"handguard_ak_khyber_swiss_grather_upper",
            "handguard_ak_izhmash_ak74_std_wood":             "67597e817ad45ed39b0fc156",  //"handguard_ak_izhmash_ak74_std_wood_upper",
            "handguard_ak_izhmash_ak74m_std_plastic":         "67597e817ad45ed39b0fc157",  //"handguard_ak_izhmash_ak74m_std_plastic_upper",
            "handguard_ak_izhmash_ak100_rail_plastic":        "67597e817ad45ed39b0fc157",  //"handguard_ak_izhmash_ak74m_std_plastic_upper",
            "handguard_ak_cugir_arms_factory_wasr_10_63_std": "67597e817ad45ed39b0fc158",  //"handguard_ak_izhmash_akm_std_wood_upper",
            "handguard_ak_izhmash_akm_std_wood":              "67597e817ad45ed39b0fc158",  //"handguard_ak_izhmash_akm_std_wood_upper",
            "handguard_ak_molot_vepr_km_vpo_136":             "67597e817ad45ed39b0fc160",  //"handguard_ak_molot_vepr_km_vpo_136_upper",
            "handguard_ak_molot_vepr_km_vpo_209":             "67597e817ad45ed39b0fc161",  //"handguard_ak_molot_vepr_km_vpo_209_upper",
            "handguard_ak_magpul_moe_ak_blk":                 "67597e817ad45ed39b0fc15b",  //"handguard_ak_magpul_moe_ak_blk_upper",
            "handguard_ak_magpul_moe_ak_fde":                 "67597e817ad45ed39b0fc15c",  //"handguard_ak_magpul_moe_ak_fde_upper",
            "handguard_ak_magpul_moe_ak_od":                  "67597e817ad45ed39b0fc15d",  //"handguard_ak_magpul_moe_ak_od_upper",
            "handguard_ak_magpul_moe_ak_plm":                 "67597e817ad45ed39b0fc15e",  //"handguard_ak_magpul_moe_ak_plm_upper",
            "handguard_ak_magpul_moe_ak_sg":                  "67597e817ad45ed39b0fc15f",  //"handguard_ak_magpul_moe_ak_sg_upper",
            "handguard_ak_zenit_b10":                         "67597e817ad45ed39b0fc157"   //"handguard_ak_izhmash_ak74m_std_plastic_upper"
        }

        //*******************************  CODE AND DATA **************************************** */


        
        //edit items.json to change size, weight, slots and whatever (aks and existing items only)
        //use a manually written json to merge objects, the modifiedItem will replace already existing items.json values 
        require("./db/items.json").forEach(modifiedItem =>
        {   
            items[modifiedItem._id]._props = Object.assign( items[modifiedItem._id]._props, modifiedItem._props )

            //if its an ak, add the new handguard slot
            if( entireAkFamily.includes(modifiedItem._id) == true)
            {
                mod_handguard_slot._id = "1" + modifiedItem._id.slice(1); //unique id everywhere, fuck mongo id
                mod_handguard_slot._parent = modifiedItem._id;
                items[modifiedItem._id]._props.Slots.push(mod_handguard_slot);
            }
        });


        //add all the new items (uppers,lowers from gastubes,sidemount and barrels)
        fs.readdirSync(__dirname + "/items",{ withFileTypes: true }).forEach(file => 
        {  
/*
            let newItemToAdd = require("./items/"+file.name)
            newItemToAdd.item._props.ConflictingItems.forEach(c_item =>
            {
                if( regex.test(c_item) == false)
                {
                    console.log("bad conflictingItems on : ",newItemToAdd.item._name, " -> ", c_item)
                }
            });



            newItemToAdd.item._props.Slots.forEach(newItemToAdd_slot =>
            { 
                if( regex.test(newItemToAdd_slot._id) == false)
                {
                    console.log("bad id on : ",newItemToAdd_slot._name, " -> ", newItemToAdd.item._name)
                }
                newItemToAdd_slot._props.filters[0].Filter.forEach(f => 
                {
                    
                    if( regex.test(f) == false)
                    {
                        console.log(f," <- bad id of item compatible inside : ",newItemToAdd_slot._name, " : ", newItemToAdd.item._name)
                    }
                })
            })
            addItemToDatabase( newItemToAdd ,handbook,items );
*/

            addItemToDatabase( require("./items/"+file.name) ,handbook,items );
            
        });


        //manual addition to the new "AkRailExtention" add-on items into weapons slots
        ["5ac66cb05acfc40198510a10", "5ac66d2e5acfc43b321d4b53", "5ac4cd105acfc40016339859" ].forEach(ak =>
        {
            items[ak]._props.Slots.find(slot => slot._name == "mod_stock" )._props.filters[0].Filter.push("5fbcc437d724d907e20BCd5c","566Cb2314bdc2d79388b4576")
        });

        ["5644bd2b4bdc2d3b4c8b4572", "5a0ec13bfcdbcb00165aa685", "59e6152586f77473dc057aa1", "59e6687d86f77411d949b251" ].forEach(ak =>
        {
            items[ak]._props.Slots.find(slot => slot._name == "mod_stock" )._props.filters[0].Filter.push("5649b2314bd2Fd79388b4576")
        });

        items["59d36a0086f7747e673f3946"]._props.Slots.find(slot => slot._name == "mod_handguard" )._props.filters[0].Filter.push("57ffa9f424597772857Ee844")

        
        let gastube209ToRemove = items["59e6687d86f77411d949b251"]._props.Slots.find(slot => slot._name == "mod_gas_block")._props.filters[0].Filter.findIndex(gastube => gastube == "5d4aab30a4b9365435358c55" )
        items["59e6687d86f77411d949b251"]._props.Slots.find(slot => slot._name == "mod_gas_block")._props.filters[0].Filter.splice(gastube209ToRemove,1);
          //5d4aab30a4b9365435358c55


        //remove current handguards on standard gasblocks and fill new upper handguards
        gasblocks.forEach(gb => 
        {
            items[gb]._props.Slots.find(slot => slot._name == "mod_handguard")._required = false;

            if(gb == "5a01ad4786f77450561fda02") //if its  vdm cutted tube
            { 
                //remove the entire slot
                items[gb]._props.Slots = [];
                items[gb]._props.Weight = 0.096;
            }
            else
            {
                //add new uppers ids
                items[gb]._props.Slots.find(slot => slot._name == "mod_handguard")._props["filters"][0].Filter = Object.values(newUpperHanguards);
                
                //modify prefab path for injecting new bundle
                items[gb]._props.Prefab.path = "gasblock/"+items[gb]._name+"_new.bundle";
            }
        });
        
        
        //updateModDB();


        //edit globals.json to change presets
        require("./db/globals.json").forEach(newPresetDB => 
        {
            globalsPresets[newPresetDB._id]._items = newPresetDB._items;
        });


        /***************************************** MASTERKEY TEST SECTION ******************************/
            /*
            addItemToDatabase(require("./test_masterkey/launcher_m870_masterkey.json")) ;
            items["launcher_m870_masterkey_settings"] = require("./test_masterkey/launcher_m870_masterkey_settings.json");

            items["mod_barrel_15_inch_AK74"]._props.Slots.find(slot => slot._name == "mod_launcher")._props.filters[0].Filter.push("launcher_m870_masterkey")
            */

        /************************************ TRADERS ASSORT FIXING *********************************/
        

        const traderAssortToChange = require("./db/traders.json");
        for( let traderDB in traderAssortToChange) //loop into all the traders
        {
            traderAssortToChange[traderDB].forEach( weaponAssort =>
            {
                if(weaponAssort.delete == true)
                {
                    weaponAssort.weapon.forEach( weaponPart => 
                    {
                        traders[traderDB].assort.items.splice(traders[traderDB].assort.items.findIndex( x => x._id == weaponPart._id), 1 )
                        delete traders[traderDB].assort.barter_scheme[weaponPart._id];
                        delete traders[traderDB].assort.loyal_level_items[weaponPart._id];
                    });
                }
                else
                {
                    weaponAssort.weapon.forEach( weaponPart => 
                    {
                        let index = traders[traderDB].assort.items.findIndex( x => x._id == weaponPart._id)
                        if( index != -1)// if the id already exist in the assort, replace it
                        {
                            traders[traderDB].assort.items[index] = weaponPart
                        }
                        else //otherwise just add the new part into the assort
                        {    
                            index = traders[traderDB].assort.items.findIndex( x => x._id == weaponAssort.weaponId)

                            //using splice to insert close to the weapon assort, using array.push doesn't work everytime 
                            traders[traderDB].assort.items.splice(index, 0, weaponPart)

                            
                        }
                    })
                }

            });
        }
       

        
        //add uppers, barrels and siderails to trader assort
        const newTraderAssort = require("./db/newAssortTrader.json");
        for( let traderNew in newTraderAssort)
        {
            traders[traderNew].assort.items = traders[traderNew].assort.items.concat(newTraderAssort[traderNew].items)
            traders[traderNew].assort.loyal_level_items = {...traders[traderNew].assort.loyal_level_items, ...newTraderAssort[traderNew].loyal_level_items}

            for(let p in newTraderAssort[traderNew].price)
            {
                traders[traderNew].assort.barter_scheme[p] = [[{"count":newTraderAssort[traderNew].price[p],"_tpl": "5449016a4bdc2d6f028b456f" }]]
            }
        }


        /***************************************** DELETING USELESS AK **************************************************************/


        //items.json
        for(let ak in aksToDelete)
        {
            items[ak]._props.CanSellOnRagfair = false;
        };
        
        //globals.json
        for(let preset in globalsPresets)
        {
            let parentItem = globalsPresets[preset]._items.find(item => item._id == globalsPresets[preset]._parent );

            if(Object.keys(aksToDelete).indexOf(parentItem._tpl) != -1 ) 
            {
                delete globalsPresets[preset]
            }
        }

        //handbook.json
        for (let handbookEntry in handbook.Items)
        {
            if( Object.keys(aksToDelete).indexOf( handbook.Items[handbookEntry].Id ) != -1 )
            {
                delete handbook.Items[handbookEntry];
            }
        }

        // bots loot/stuff
        for(let botType in bots) 
        {
            for(let weapon in bots[botType].inventory.equipment.FirstPrimaryWeapon) 
            {
                if(Object.keys(aksToDelete).indexOf(weapon) != -1 )
                {
                    if(bots[botType].inventory.equipment.FirstPrimaryWeapon[aksToDelete[weapon]] === undefined)
                    {
                        bots[botType].inventory.equipment.FirstPrimaryWeapon[aksToDelete[weapon]] = bots[botType].inventory.equipment.FirstPrimaryWeapon[weapon];
                    }
                    else
                    {
                        bots[botType].inventory.equipment.FirstPrimaryWeapon[aksToDelete[weapon]] += bots[botType].inventory.equipment.FirstPrimaryWeapon[weapon];

                    }
                    delete bots[botType].inventory.equipment.FirstPrimaryWeapon[weapon];

                    //console.log(bots[botType].inventory.equipment.FirstPrimaryWeapon[weapon], items[weapon]._name,"after", bots[botType].inventory.equipment.FirstPrimaryWeapon[aksToDelete[weapon]])
                }
            }

            for(let weapon in bots[botType].inventory.equipment.SecondPrimaryWeapon) 
            {
                if(Object.keys(aksToDelete).indexOf(weapon) != -1 )
                {
                    if(bots[botType].inventory.equipment.SecondPrimaryWeapon[aksToDelete[weapon]] === undefined)
                    {
                        bots[botType].inventory.equipment.SecondPrimaryWeapon[aksToDelete[weapon]] = bots[botType].inventory.equipment.SecondPrimaryWeapon[weapon];
                    }
                    else
                    {
                        bots[botType].inventory.equipment.SecondPrimaryWeapon[aksToDelete[weapon]] += bots[botType].inventory.equipment.SecondPrimaryWeapon[weapon];

                    }
                    delete bots[botType].inventory.equipment.SecondPrimaryWeapon[weapon];

                    //console.log(bots[botType].inventory.equipment.FirstPrimaryWeapon[weapon], items[weapon]._name,"after", bots[botType].inventory.equipment.FirstPrimaryWeapon[aksToDelete[weapon]])
                }
            }


            for(let weapon in bots[botType].inventory.mods)
            {
                if(Object.keys(aksToDelete).indexOf(weapon) != -1 )
                {
                    if( bots[botType].inventory.mods[aksToDelete[weapon]] !== undefined )
                    {   
                        Object.assign(bots[botType].inventory.mods[aksToDelete[weapon]], bots[botType].inventory.mods[weapon]) 
                        delete bots[botType].inventory.mods[weapon];
                    }
                    else
                    {
                        bots[botType].inventory.mods[aksToDelete[weapon]] = bots[botType].inventory.mods[weapon];
                        delete bots[botType].inventory.mods[weapon];
                    }   
                }
            }
        }

        //trader.assort.json
        for(let trader in traders) 
        {
            if(traders[trader].base.nickname != "caretaker" && trader != "ragfair")
            {
                for(let assortItem in traders[trader].assort.items)
                {   
                    if( Object.keys(aksToDelete).indexOf( traders[trader].assort.items[assortItem]._tpl) != -1 )
                    {
                        traders[trader].assort.items[assortItem]._tpl = aksToDelete[traders[trader].assort.items[assortItem]._tpl]
                        //traders[trader].assort.items.splice(assortItem,1)
                    }
                }
            }
        }

        
        /************************************************** QUEST FIXING ************************************************/
    
        for( let quest in quests)
        {
            quests[quest].rewards.Success.forEach(reward =>
            {
                if(reward.type == "Item" || reward.type == "AssortmentUnlock" )
                {
                    let tpl = reward.items.find(x => x._id == reward.target)._tpl;
                    if( entireAkFamily2.includes( tpl ) == true)
                    {
                        reward.items =  WeaponFixer(reward.items,reward.target)
                        if(aksToDelete[tpl] !== undefined)
                        {
                            reward.items.find(x => x._id == reward.target)._tpl = aksToDelete[tpl];
                        }
                    }
                }
            });

            quests[quest].rewards.Started.forEach(reward =>
            {
                let tpl = reward.items.find(x => x._id == reward.target)._tpl;
                if(reward.type == "Item" && entireAkFamily2.includes(tpl) == true &&  aksToDelete[tpl] !== undefined )
                {
                    reward.items.find(x => x._id == reward.target)._tpl = aksToDelete[tpl];
                }

            });

            quests[quest].conditions.AvailableForFinish.forEach(condition => 
            {
                if(condition.conditionType == "WeaponAssembly" && Object.keys(aksToDelete).includes(condition.target[0]) == true )
                { 
                    for (const [lang, localeData] of Object.entries(locales) ) 
                    {
                        switch(condition.target[0])
                        {
                            case "5ac66d015acfc400180ae6e4":  //"AK-101",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AK-102", "AK-101" )
                                break;

                            case "5ac66d725acfc43b321d4b60":  //"AK-103",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AK-104", "AK-103" )
                                break;

                            case "5ac66d9b5acfc4001633997a":  //"AK-74M",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AK-105", "AK-74M" )
                                break;

                            case "59d6088586f774275f37482f":  //"AKMN",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AKM", "AKMN" )
                                break;

                            case "59ff346386f77477562ff5e2":  //"AKMSN",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AKMS", "AKMSN" )
                                break;

                            case "5bf3e03b0db834001d2c4a9c":  //"AK-74N",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AK-74", "AK-74N" )
                                break;

                            case "5bf3e0490db83400196199af":  //"AKS-74N",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AKS-74", "AKS-74N" )
                                break;

                            case "57dc2fa62459775949412633":  //"AKS-74UN",
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AKS-74U", "AK-74UN")
                                break;

                            case "5839a40f24597726f856b511":  //"AKS-74UN"
                                locales[lang][condition.id] = locales[lang][condition.id].replace("AKS-74UB", "AK-74UN")
                                break;

                        }           
                    }

                    condition.target[0] = aksToDelete[ condition.target[0] ]
                }
            });

        }

        Object.keys(aksToDelete).forEach(akTodelete =>
        {
            repetablesQuests.rewards.itemsBlacklist.push(akTodelete);
            repetablesQuests.data.Completion.itemsBlacklist[0].itemIds.push(akTodelete)
        });

        /************************************** HIDEOUT CRAFTING FIX **********************************/

        productions.recipes.find(prod => prod.endProduct == "59d6088586f774275f37482f").endProduct = "5a0ec13bfcdbcb00165aa685";


        // *********************************** DEFAULT INVENTORY FIXING *******************************/


        let editionsToChange = require("./db/editions.json");
        for(let edition in editionsToChange)
        {
            editionsToChange[edition].forEach(weaponEdition => 
            {                
                //send all the parts into the mechanic lol 
                weaponEdition.weapon.forEach(weaponPart => 
                {
                    let index = profiles[edition].bear.character.Inventory.items.findIndex( x => x._id == weaponPart._id)
                    if( index != -1)// if the id already exist in the assort, replace it
                    {
                        profiles[edition].bear.character.Inventory.items[index] = weaponPart
                    }
                    else //otherwise just add the new part into the assort
                    { 
                        profiles[edition].bear.character.Inventory.items.push(weaponPart)
                    }
                });
            });
        }


        /***********************************  BOT GENERATION FIXING ****************************************/
        
        
        for(let botType in bots)
        {
            let handguardList = [];
            for(let mod in bots[botType].inventory.mods)
            {
                if( entireAkFamily.includes(mod) == true )
                {
                    //add barrels
                    if(items[mod]._props.Slots.find(slot => slot._name == "mod_barrel") != undefined)
                    {

                        bots[botType].inventory.mods[mod]["mod_barrel"] = items[mod]._props.Slots.find(slot => slot._name == "mod_barrel")._props.filters[0].Filter;
                        bots[botType].inventory.mods[mod]["mod_barrel"].forEach(barrel =>
                        {
                            bots[botType].inventory.mods[barrel] = {}
                            bots[botType].inventory.mods[barrel]["mod_gas_block"] = bots[botType].inventory.mods[mod]["mod_gas_block"]
                            bots[botType].inventory.mods[barrel]["mod_muzzle"] = bots[botType].inventory.mods[mod]["mod_muzzle"]
                            bots[botType].inventory.mods[barrel]["mod_sight_rear"] = bots[botType].inventory.mods[mod]["mod_sight_rear"]
                            
                            if( bots[botType].inventory.mods[mod]["mod_sight_front"] !== undefined )
                            {
                                bots[botType].inventory.mods[barrel]["mod_sight_front"] = bots[botType].inventory.mods[mod]["mod_sight_front"]
                            }

                            if( bots[botType].inventory.mods[mod]["mod_launcher"] !== undefined && items[mod]._props.Slots.find(slot => slot._name == "mod_launcher") !== undefined)
                            {
                                bots[botType].inventory.mods[barrel]["mod_launcher"] = bots[botType].inventory.mods[mod]["mod_launcher"]
                            }
                        });

                        delete bots[botType].inventory.mods[mod]["mod_gas_block"]
                        delete bots[botType].inventory.mods[mod]["mod_muzzle"]
                        delete bots[botType].inventory.mods[mod]["mod_sight_rear"]
                        delete bots[botType].inventory.mods[mod]["mod_sight_front"]
                        delete bots[botType].inventory.mods[mod]["mod_launcher"]

                    }                    
                }
                else if( Object.keys(linkLowerAndUpper).includes(mod) == true || Object.keys(lowerAndUppers).includes(items[mod]._name) == true )//if its a handguard
                {
                    for(let modSlot in bots[botType].inventory.mods[mod])
                    {
                        if( items[mod]._props.Slots.find(slot => slot._name == modSlot) === undefined )
                        {
                            delete bots[botType].inventory.mods[mod][modSlot]
                        }
                    }
                    handguardList.push(mod)

                }
                else if( gasblocks.concat(separatedGasBlocks).includes(mod) == true )
                { 

                    for(let modSlot in bots[botType].inventory.mods[mod])
                    {
                        if( items[mod]._props.Slots.find(slot => slot._name == modSlot) === undefined )
                        {
                            delete bots[botType].inventory.mods[mod][modSlot]
                        }
                        if(modSlot == "mod_handguard")
                        {
                            handguardList.concat( bots[botType].inventory.mods[mod][modSlot] )
                        }
                    }

                    if(mod == "5a01ad4786f77450561fda02")
                    {
                        delete bots[botType].inventory.mods[mod]
                    }

                }
            }

            //handguards on weapons
            for(let mod in bots[botType].inventory.mods)
            {
                if( entireAkFamily.includes(mod) == true )
                {
                    bots[botType].inventory.mods[mod]["mod_handguard"] = handguardList;
                    handguardList.forEach(h => 
                    {
                        if(linkLowerAndUpper[h] !== undefined)
                        {
                            bots[botType].inventory.mods[h]["mod_handguard"] = [ linkLowerAndUpper[h] ]
                        }

                    });
                }
                if( gasblocks.includes(mod) == true && bots[botType].inventory.mods[mod]["mod_handguard"] !== undefined )
                { 
                    let listOfUppersToReplace = []
                    handguardList.forEach(h => 
                    {
                        if( lowerAndUppers[ items[h]._name ] !== undefined )
                        {
                           listOfUppersToReplace.push(lowerAndUppers[ items[h]._name ])
                        }

                    });
                    bots[botType].inventory.mods[mod]["mod_handguard"] = listOfUppersToReplace
                        
                    //bots[botType].inventory.mods[mod][modSlot] = items[mod]._props.Slots.find(slot => slot._name == modSlot)._props.filters[0].Filter;
                    

                }
            }
        }
        

        /********************************** MAP/LOCATION LOOT FIXING ****************************************************/

        for(let map in locations)
        {
            for(let staticLootContainer in  locations[map].staticLoot)
            {
                locations[map].staticLoot[staticLootContainer].itemDistribution.forEach(itemInContainer => 
                {
                    if( Object.keys(aksToDelete).includes(itemInContainer.tpl)  )
                    {
                        if(locations[map].staticLoot[staticLootContainer].itemDistribution.find(itemInContainer2 => itemInContainer2.tpl == aksToDelete[itemInContainer.tpl] ) === undefined )
                        {
                            itemInContainer.tpl = aksToDelete[itemInContainer.tpl];
                        }
                        else
                        {
                            locations[map].staticLoot[staticLootContainer].itemDistribution.find(itemInContainer2 => itemInContainer2.tpl == aksToDelete[itemInContainer.tpl] ).relativeProbability += itemInContainer.relativeProbability
                            itemInContainer.relativeProbability = 0;
                        }
                    }
                });
            }
        }


        /***************************************************** FUNCTIONS **************************************************/

        //weapon : array of objects, weaponParentId : string
        function WeaponFixer(weapon,weaponParentId)
        { 
            let baseweapon = weapon.find(weaponPart => entireAkFamily2.indexOf(weaponPart._tpl) != -1 );
            let handguard = weapon.find(wp => wp.slotId == "mod_handguard" )

            if( handguard !== undefined && excludedWeaponToFix.includes(baseweapon._tpl) == false )
            {
                handguard.parentId = weaponParentId;
                let upperToAdd = lowerAndUppers[ items[handguard._tpl]._name ];

                if( upperToAdd !== undefined )
                {
                    weapon.push(
                    {
                        "_id": hashUtil.generate(),
                        "_tpl": upperToAdd,
                        "parentId": weapon.find(weaponPart => weaponPart.slotId == "mod_gas_block")._id,
                        "slotId": "mod_handguard"
                    });
                }
                else
                {
                    upperToAdd = linkLowerAndUpper[handguard._tpl] 
                    weapon.push(
                    {
                        "_id": hashUtil.generate(),
                        "_tpl": upperToAdd,
                        "parentId": handguard._id,
                        "slotId": "mod_handguard"
                    });
                }
            }

            

            let barrelToadd = 
            {
                "_id": hashUtil.generate(),
                "_tpl": "",
                "parentId": baseweapon._id,
                "slotId": "mod_barrel"
            };

            switch(baseweapon._tpl)
            {
                case "5ac66cb05acfc40198510a10" : //ak-101
                    barrelToadd._tpl = "67597e817ad45ed39b0fc16f";
                break;

                case "5ac66d015acfc400180ae6e4" : //ak-102
                    barrelToadd._tpl = "67597e817ad45ed39b0fc16c";
                break;

                case "5ac66d2e5acfc43b321d4b53" : //ak-103
                    barrelToadd._tpl = "67597e817ad45ed39b0fc170";
                break;

                case "5ac66d725acfc43b321d4b60" : //ak-104
                    barrelToadd._tpl = "67597e817ad45ed39b0fc16d";
                break;

                case "5ac66d9b5acfc4001633997a" : //ak-105
                    barrelToadd._tpl = "67597e817ad45ed39b0fc16b";
                break;

                //use this case to add siderail or not ??
                case "59d6088586f774275f37482f": //akm
                case "59ff346386f77477562ff5e2": //akms
                case "5a0ec13bfcdbcb00165aa685": //akmN
                case "5abcbc27d8ce8700182eceeb": //akmsN
                case "59e6152586f77473dc057aa1": //vepr 136
                    barrelToadd._tpl = "67597e817ad45ed39b0fc171";
                break;

                case "5bf3e03b0db834001d2c4a9c":  //ak-74
                case "5bf3e0490db83400196199af":  //aks-74
                case "5ac4cd105acfc40016339859":  //ak-74M
                case "5644bd2b4bdc2d3b4c8b4572":  //ak-74N
                case "5ab8e9fcd8ce870019439434":  //akS-74N
                    barrelToadd._tpl = "67597e817ad45ed39b0fc16e";
                break;

                case "628a60ae6b1d481ff772e9c8": //RD-704
                    weapon.push(
                    {
                        "_id": hashUtil.generate(),
                        "_tpl": "67597e817ad45ed39b0fc16a", //handguard_slr_ion_lite_704
                        "parentId": weaponParentId,
                        "slotId": "mod_handguard"
                    });
                    barrelToadd._tpl = null;
                    break;

                default :
                    barrelToadd._tpl = null;
                    break;

            }

            if( barrelToadd._tpl !== null )
            { 

                weapon.find(weaponPart3 => weaponPart3.slotId == "mod_muzzle" ).parentId = barrelToadd._id
                weapon.find(weaponPart3 => weaponPart3.slotId == "mod_gas_block" ).parentId = barrelToadd._id
                
                if( weapon.find(weaponPart3 => weaponPart3.slotId == "mod_sight_rear" ) !== undefined)
                {
                    weapon.find(weaponPart3 => weaponPart3.slotId == "mod_sight_rear" ).parentId = barrelToadd._id
                }
                weapon.push(barrelToadd)
            } 

            return weapon;
        }


        function addItemToDatabase(itemToAdd)
        {
            handbook.push(itemToAdd.handbook);
            items[itemToAdd.handbook.Id] = itemToAdd.item;

            for (const [lang, localeData] of Object.entries(locales)) 
            {
                for (const [entry, text] of Object.entries(itemToAdd.locale)) 
                {
                    locales[lang][entry] = text;
                }                
            }
        }


        function updateModDB()
        {
            let path = "./user/mods/AkEnhancedModding/db/";
            let theDB = require("./db/items.json");
            theDB.forEach(modifiedItem =>
            {   
/*              if( modifiedItem._props.ConflictingItems !== undefined)
                {
                    modifiedItem._props.ConflictingItems.forEach(c_item =>
                    {
                        if(regex.test(c_item) == false   )
                        {
                            console.log("bad mongoid on conflictingItems of weapon : ", modifiedItem._name,  c_item )
                        }
                    })
                }
*/

                if(modifiedItem._name.includes("handguard") == true && modifiedItem._props.Slots !== undefined)
                {

                    modifiedItem._props.Slots.forEach(modifiedItemSlot => 
                    {
/*
                        if(regex.test(modifiedItemSlot._id) == false   )
                        {
                            console.log("bad id on slot :", modifiedItemSlot._name, "weapon : ", modifiedItem._name)
                        }

                        modifiedItemSlot._props.filters[0].Filter.forEach(f => 
                        {
                            if( regex.test(f) == false)
                            {
                                console.log(f," <- bad id of item compatible inside : ",newItemToAdd_slot._name, " : ", newItemToAdd.item._name)
                            }
                        })
*/

                        let a = items[modifiedItem._id]._props.Slots.find(x => x._id == modifiedItemSlot._id)
                        if(a !== undefined && modifiedItemSlot._props.filters[0].Filter.length < a._props.filters[0].Filter.length)
                        {                        
                            modifiedItem._props.Slots.find(x => x._id == modifiedItemSlot._id)._props.filters[0].Filter = a._props.filters[0].Filter
                        }
                    }); 
                }

            });



            let tradersDbToUpdate = {}
            for(let trader in traders) 
            {
                if(traders[trader].base.nickname != "caretaker" && trader != "ragfair")
                {
                    tradersDbToUpdate[trader] = [];
                    for(let assortItem in traders[trader].assort.items)
                    {   
                        if( entireAkFamily2.includes( traders[trader].assort.items[assortItem]._tpl) == true )
                        {
                            let parent = traders[trader].assort.items[assortItem]._id;
                            let weapon = itemHelper.findAndReturnChildrenByAssort(parent, traders[trader].assort.items )
                            if( weapon.length > 0 )
                            {
                                weapon.push( traders[trader].assort.items[assortItem] )

                                tradersDbToUpdate[trader].push(
                                {
                                    "weaponId" : parent,
                                    "weaponName": items[traders[trader].assort.items[assortItem]._tpl]._name,
                                    "delete": false,    //Object.keys(aksToDelete).includes( traders[trader].assort.items[assortItem]._tpl ),
                                    "weapon" : WeaponFixer(weapon,parent)
                                }); 
                            }
                        }
                    }
                    if( tradersDbToUpdate[trader].length == 0 ){ delete tradersDbToUpdate[trader] }
                }
            }
            

            let editionsDbToUpdate = {};
            for(let profile in profiles)
            {
                editionsDbToUpdate[profile] = [];

                for(let inventoryItem in profiles[profile].bear.character.Inventory.items)
                {   
                    if( entireAkFamily2.includes( profiles[profile].bear.character.Inventory.items[inventoryItem]._tpl ) == true )
                    {
                        let parent = profiles[profile].bear.character.Inventory.items[inventoryItem]._id;
                        let weapon = itemHelper.findAndReturnChildrenByAssort(parent, profiles[profile].bear.character.Inventory.items );

                        weapon.push( profiles[profile].bear.character.Inventory.items[inventoryItem] );
                        editionsDbToUpdate[profile].push(
                        {
                            "_id" : parent,
                            "weaponName": items[ profiles[profile].bear.character.Inventory.items[inventoryItem]._tpl ]._name,
                            "weapon" : WeaponFixer(weapon,parent)
                        })
                    }
                }
            }


            let globalsPresetDbToUpdate = [];
            for( let preset in globalsPresets )
            {  
                if( entireAkFamily.includes( globalsPresets[preset]._items.find(x => x._id == globalsPresets[preset]._parent )._tpl ) == true )
                {
                    globalsPresetDbToUpdate.push( 
                    {   
                        "_id" : globalsPresets[preset]._id,
                        "_name" : globalsPresets[preset]._name,
                        "_items" :  WeaponFixer(globalsPresets[preset]._items, globalsPresets[preset]._parent) 
                    });
                }
            }


            //fs.writeFileSync( path + "items_new.json"   , JSON.stringify(theDB,null,4) );
            //fs.writeFileSync( path + "traders_new.json" , JSON.stringify(tradersDbToUpdate,null,4) );
            //fs.writeFileSync( path + "editions_new.json", JSON.stringify(editionsDbToUpdate,null,4) );
            //fs.writeFileSync( path + "globals_new.json" , JSON.stringify(globalsPresetDbToUpdate,null,4) );

        }


    }



}

module.exports = { mod: new AkSplitterMod() };