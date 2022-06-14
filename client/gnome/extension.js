/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const St = imports.gi.St;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const CheckBox = imports.ui.checkBox;

class Extension {
    constructor() {
        this._indicator = null;
    }

    setAutoModeToAutoSwitch() {
        const actual_mode = this.proxySetting.get_string('mode')
        if (actual_mode.localeCompare('auto') === 0) {
            this.autoProxySwitch._switch.state = true;
        } else {
            this.autoProxySwitch._switch.state = false;
        }
    }
    
    setEnableModeToEnableSwitch() {
        const actual_mode = this.proxySetting.get_string('mode')
        if (actual_mode.localeCompare('none') === 0) {
            this.enableProxySwitch._switch.state = false;
            this.autoProxySwitch.setSensitive(false)
        } else if (actual_mode.localeCompare('manual') === 0 || actual_mode.localeCompare('auto') === 0) {
            this.enableProxySwitch._switch.state = true;
            this.autoProxySwitch.setSensitive(true)
        }
        this.setAutoModeToAutoSwitch();
    }

    // setActualModeToSetting() {
    //     const actual_mode = 
    // }

    enable() {
        const extension_this = this
        log(`enabling ${Me.metadata.name}`);

        let indicatorName = `${Me.metadata.name} Indicator`;
        
        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, indicatorName, false);
        
        // Add an icon
        // let icon = new St.Icon({Gio.icon_new_for_string(Me.path + "/icons/my_icon.png")});
        let icon = new St.Icon({
            gicon: Gio.icon_new_for_string(Me.path + "/icons/lproxy.png"),
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(icon);

        // `Main.panel` is the actual panel you see at the top of the screen,
        // not a class constructor.
        Main.panel.addToStatusArea(indicatorName, this._indicator);

        let dndMenu = this._indicator.menu;

        this.proxySetting = new Gio.Settings({ schema: 'org.gnome.system.proxy' });
        
        /* Auto switch configuration */
        this.autoProxySwitch = new PopupMenu.PopupSwitchMenuItem(
            "Auto",
            false,
        );
        this.setAutoModeToAutoSwitch()
        var set_auto_mode_to_auto_switch_handler = function() {
            log("# Auto mode changed");
            extension_this.setAutoModeToAutoSwitch()
        }
        this.proxySetting.connect("changed", set_auto_mode_to_auto_switch_handler)

        /* Enable proxy switch configuration */
        this.enableProxySwitch = new PopupMenu.PopupSwitchMenuItem(
            "Enable Proxy",
            false,
        );
        this.setEnableModeToEnableSwitch()
        var setting_to_switch_func = function() {
            log("# Proxy mode changed");
            extension_this.setEnableModeToEnableSwitch()
        }
        this.proxySetting.connect("changed", setting_to_switch_func);
        
        // var switch_to_setting_func = function() {
        //     log("# Enable switch toggled");
        //     extension_this.setActualModeToSetting()
        // }
        // this.enableProxySwitch.connect("toggled", switch_to_setting_func)

        //this.checkBoxAutoProxy = new CheckBox.CheckBox('label')
        // log(Object.keys(this.switchProxyEnabledItem))
        // log(typeof this.switchProxyEnabledItem._delegate)
        // log(this.switchProxyEnabledItem._parent)
        // log(Object.keys(this.switchProxyEnabledItem._statusBin))
        // log(typeof this.switchProxyEnabledItem._active)
        // log(typeof this.switchProxyEnabledItem._activatable)
        // log(Object.keys(this.switchProxyEnabledItem._box))
        // this.switchProxyEnabledItem._sensitive = false
        // this.switchProxyEnabledItem._active = false
        // this.switchProxyEnabledItem._activatable = false

        /* this.proxySetting.conn
        actual_mode = 
        this.proxySettingHttp = new Gio.Settings({ schema: 'org.gnome.system.proxy.http' });
        this.proxySettingHttps = new Gio.Settings({ schema: 'org.gnome.system.proxy.https' });
        log(this.proxySetting.get_string('mode'))
        log(this.proxySettingHttps.get_string('host'))
        log(this.proxySettingHttps.get_int('port'))
        log(this.proxySettingHttp.get_string('host'))
        log(this.proxySettingHttp.get_int('port')) */
        // this.switchProxyEnabledItem.setSensitive(false)
        dndMenu.addMenuItem(this.autoProxySwitch);
        dndMenu.addMenuItem(this.enableProxySwitch);
        // dndMenu.add_child(this.checkBoxAutoProxy);
        // this.switchProxyEnabledItem.disable();
        // log(Object.keys(this.switchProxyEnabledItem))
        // this.switchProxyEnabledItem._active = false
    }
    
    // REMINDER: It's required for extensions to clean up after themselves when
    // they are disabled. This is required for approval during review!
    disable() {
        log(`disabling ${Me.metadata.name}`);

        this._indicator.destroy();
        this._indicator = null;
    }
}


function init() {
    log(`initializing ${Me.metadata.name}`);
    
    return new Extension();
}
