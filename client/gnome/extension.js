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

class Extension {
    constructor() {
        this._indicator = null;
    }
    
    enable() {
        log(`enabling ${Me.metadata.name}`);

        let indicatorName = `${Me.metadata.name} Indicator`;
        
        // Create a panel button
        this._indicator = new PanelMenu.Button(0.0, indicatorName, false);
        
        // Add an icon
        log(`Helo ###`)
        // let icon = new St.Icon({Gio.icon_new_for_string(Me.path + "/icons/my_icon.png")});
        log(`Helo2 ###`)
        log('###'+Me.path + "/icons/my_icon.png")
        log(`${Gio.ThemedIcon.names}`)
        let icon = new St.Icon({
            gicon: Gio.icon_new_for_string(Me.path + "/icons/lproxy.png"),
            style_class: 'system-status-icon'
        });
        this._indicator.add_child(icon);
        log(`Helo3 ###`)

        // `Main.panel` is the actual panel you see at the top of the screen,
        // not a class constructor.
        Main.panel.addToStatusArea(indicatorName, this._indicator);

        let dndMenu = this._indicator.menu;
        log(`HELO4 $$$`)

        let switchDNDitem = new PopupMenu.PopupSwitchMenuItem(
            "Enable Proxy",
            false,
        );

        this.proxySetting = new Gio.Settings({ schema: 'org.gnome.system.proxy' });
        let proxySetting = this.proxySetting
        // log(Gio.Settings.list_schemas())
        function setActualMode(proxySetting) {
            const actual_mode = proxySetting.get_string('mode')
            // log('&&&&&'+typeof actual_mode)
            // log(actual_mode.localeCompare('none'))
            // log(actual_mode === 'none')
            if (actual_mode.localeCompare('none') === 0) {
                log(`?? NONE`)
                switchDNDitem._switch.state = false;
            } else if (actual_mode.localeCompare('manual') === 0 || actual_mode.localeCompare('auto') === 0) {
                log(`?? MANUAL`)
                switchDNDitem._switch.state = true;
            }
            // log('&^^ ACTUAL'+actual_mode)
        }
        setActualMode(proxySetting)
        var proxy_connect_func = function() {
            log("I see, you changed it!");
            // proxySetting = new Gio.Settings({ schema: 'org.gnome.system.proxy' });
            setActualMode(proxySetting)
        }
        // proxy_connect_func.setActualMode = setActualMode
        // proxy_connect_func.proxySetting = this.proxySetting
        proxySetting.connect("changed", proxy_connect_func);
        /* this.proxySetting.conn
        actual_mode = 
        this.proxySettingHttp = new Gio.Settings({ schema: 'org.gnome.system.proxy.http' });
        this.proxySettingHttps = new Gio.Settings({ schema: 'org.gnome.system.proxy.https' });
        log(this.proxySetting.get_string('mode'))
        log(this.proxySettingHttps.get_string('host'))
        log(this.proxySettingHttps.get_int('port'))
        log(this.proxySettingHttp.get_string('host'))
        log(this.proxySettingHttp.get_int('port')) */
        dndMenu.addMenuItem(switchDNDitem);

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
