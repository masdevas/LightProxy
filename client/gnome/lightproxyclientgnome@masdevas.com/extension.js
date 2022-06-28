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
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
var Clutter = imports.gi.Clutter;

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

    setSwitchesToSetting() {
        const auto_state = this.autoProxySwitch._switch.state
        const enable_state = this.enableProxySwitch._switch.state
        if (auto_state && enable_state) {
            this.proxySetting.set_string('mode', 'auto')
        } else if (enable_state) {
            this.proxySetting.set_string('mode', 'manual')
        } else {
            this.proxySetting.set_string('mode', 'none')
        }
    }

    enable() {
        dwr
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
        for (let key in dndMenu) {
            log(`@@@ ${key}`)
        }

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
        var auto_switch_to_setting_func = function() {
            log("# Auto switch toggled");
            extension_this.setSwitchesToSetting()
        }
        this.autoProxySwitch.connect("toggled", auto_switch_to_setting_func)

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
        var enable_switch_to_setting_func = function() {
            log("# Enable switch toggled");
            extension_this.setSwitchesToSetting()
        }
        this.enableProxySwitch.connect("toggled", enable_switch_to_setting_func)
        // this.menu_info = new PopupMenu.PopupBaseMenuItem({reactive: false});
        // this.menu_info_box = new St.BoxLayout();
        
        // // let a = new Clutter.GridLayout({
        // //     orientation: Clutter.Orientation.VERTICAL
        // // })
        // // for (var key in a) {
        // //     let b = typeof key
        // //     log(`### ${key} ${b}`)
            
        // // }

        // this.menu_info_box_table = new St.Widget({
        //     style: 'width: 500px; height: 500px; background-color: brown;padding: 10px 0px 10px 0px; spacing-rows: 10px; spacing-columns: 15px;',
        //     layout_manager: new Clutter.GridLayout({
        //         orientation: Clutter.Orientation.VERTICAL
        //     })
        // });

        // this.menu_info_box_table_layout = this.menu_info_box_table.layout_manager;

        // this.menu_info_box_table_layout.attach(
        //         new St.Icon({
        //             gicon: Gio.icon_new_for_string(Me.path + "/icons/lproxy.png"),
        //             style_class : 'sm-label',
        //         }), 0, 0, 1, 1);
        // this.menu_info_box_table_layout.attach(
        //         new St.DrawingArea({
        //             style_class : 'sm-label',
        //             reactive : true,
        //             can_focus : true,
        //             track_hover : true,
        //             width: 10,
        //             height: 10
        //         }), 1, 0, 1, 1);
        // this.menu_info_box_table_layout.attach(
        //         new St.Entry({
        //             text: 'hello2',
        //             style_class : 'sm-label',
        //             x_align: Clutter.ActorAlign.START,
        //             y_align: Clutter.ActorAlign.CENTER
        //         }), 0, 1, 1, 1);
        // this.tmp_label = new St.Label({
        //             text: 'world2',
        //             style_class : 'sm-label',
        //             x_align: Clutter.ActorAlign.START,
        //             y_align: Clutter.ActorAlign.CENTER
        //         })
        // this.menu_info_box_table_layout.attach(
        //         this.tmp_label, 1, 1, 1, 1);
        // this.setInterval = function setInterval(func, delay, ...args) {
        //     const wrappedFunc = () => {
        //         return func.apply(this, args) || true;
        //     };
        //     return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, wrappedFunc);
        // }
        // this.intervalId = this.setInterval(function() {
        //     // alert("Interval reached every 5s")
        //     var currentdate = new Date(); 
        //     var datetime = "Last Sync: "
        //         + currentdate.getSeconds();
        //     extension_this.tmp_label.set_text(datetime)
        // }, 1);
        // this.menu_info_box_table_layout.attach(
        //         new St.PasswordEntry({
        //             text: 'hello2',
        //             style_class : 'sm-label',
        //             x_align: Clutter.ActorAlign.START,
        //             y_align: Clutter.ActorAlign.CENTER
        //         }), 0, 2, 1, 1);
        // this.gtk_button = new St.Button({
        //             label: 'hello2',
        //             style_class : 'sm-label',
        //             x_align: Clutter.ActorAlign.START,
        //             y_align: Clutter.ActorAlign.CENTER
        //         })
        // this.menu_info_box_table_layout.attach(
        //         this.gtk_button, 1, 2, 1, 1);
        // this.application = new Gtk.Application({
        //     application_id: 'org.gnome.Sandbox.ImageViewerExample',
        //     flags: Gio.ApplicationFlags.FLAGS_NONE
        // });

        // this._window = new Gtk.ApplicationWindow({
        //     application: this._app,
        //     defaultHeight: 600,
        //     defaultWidth: 800
        // });
        // this.gtk_button.connect('clicked', (self) => {
        //     log(`@@ CLICKED`)
        //     //extension_this._window.present();
        // })

        // for (let elt in elts) {
        //     if (!elts[elt].menu_visible) {
        //         continue;
        //     }

        //     // Add item name to table
        //     menu_info_box_table_layout.attach(
        //         new St.Label({
        //             text: elts[elt].item_name,
        //             style_class: Style.get('sm-title'),
        //             x_align: Clutter.ActorAlign.START,
        //             y_align: Clutter.ActorAlign.CENTER
        //         }), 0, row_index, 1, 1);

        //     // Add item data to table
        //     let col_index = 1;
        //     for (let item in elts[elt].menu_items) {
        //         menu_info_box_table_layout.attach(
        //             elts[elt].menu_items[item], col_index, row_index, 1, 1);

        //         col_index++;
        //     }

        //     row_index++;
        // }
        // if (shell_Version < '3.36') {
        //     tray_menu._getMenuItems()[0].actor.get_last_child().add(menu_info_box_table, {expand: true});
        // } else {
        //     tray_menu._getMenuItems()[0].actor.get_last_child().add_child(menu_info_box_table);
        // }
        
        this.menu_info_box.add(this.menu_info_box_table);
        this.menu_info.add(this.menu_info_box);


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
        dndMenu.addMenuItem(this.menu_info);
        // dndMenu.add_child(this.checkBoxAutoProxy);
        // this.switchProxyEnabledItem.disable();
        // log(Object.keys(this.switchProxyEnabledItem))
        // this.switchProxyEnabledItem._active = false
        log(`enabled ${Me.metadata.name}`);
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
