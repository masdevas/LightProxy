import shutil
import json
import re

def upgrade_with_configs(proxy_config_lines, config, users):
    credentials_mask = r'[0-9a-zA-Z_@]+ [0-9a-zA-Z_@]+$'
    ipv4_mask = r'\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b'
    ipv6_mask = r'(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))'
    for line_idx, line in enumerate(proxy_config_lines):
        if re.match(r'Port [0-9]+$', line):
            port = str(config['port'])
            if not port.isdigit():
                raise Exception(f'Port value isn`t a digit: {port}')
            result_line = re.sub(r'[0-9]+', str(port), line)
            proxy_config_lines[line_idx] = result_line
        elif re.search(r'ConnectPort [0-9]+$', line):
            connect_ports = config['connect_method_ports']
            while line_idx < len(proxy_config_lines) and re.search(r'ConnectPort [0-9]+$', proxy_config_lines[line_idx]):
                del proxy_config_lines[line_idx]
            for connect_port in connect_ports:
                str_connect_port = str(connect_port)
                if not str_connect_port.isdigit():
                    raise Exception(f'Port value isn`t a digit: {port}')
                proxy_config_lines.insert(line_idx, f'ConnectPort {str_connect_port}')
        elif re.search(r'Allow '+ipv4_mask, line) or re.search(r'Allow '+ipv6_mask, line):
            allowed_ips = config['allowed_ips']
            while line_idx < len(proxy_config_lines):
                target_line = proxy_config_lines[line_idx]
                cond = re.search(r'Allow '+ipv4_mask, target_line) or re.search(r'Allow '+ipv6_mask, target_line)
                if not cond:
                    break
                del proxy_config_lines[line_idx]
            if isinstance(allowed_ips, list):
                internal_line_idx = line_idx
                for allowed_ip in allowed_ips:
                    if not re.match(ip_mask, allowed_ip):
                        raise Exception(f'This IP isn`t allowed: {allowed_ip}')
                    proxy_config_lines.insert(internal_line_idx, f'Allow {allowed_ip}')
                    internal_line_idx += 1
            elif isinstance(allowed_ips, str):
                pass
            else:
                raise Exception(f'Wrong type of "allowed_ips": {type(allowed_ips)}')
        elif re.search(r'BasicAuth '+credentials_mask, line):
            while line_idx < len(proxy_config_lines) and re.search(r'BasicAuth '+credentials_mask, proxy_config_lines[line_idx]):
                del proxy_config_lines[line_idx]
            users_dict = users['users']
            for user, password in users_dict.items():
                proxy_config_lines.insert(line_idx, f'BasicAuth {user} {password}')

def main():
    with open('/home/lightproxy-server/config.json') as config_file:
        config = json.load(config_file)
    with open('/home/lightproxy-server/users.json') as users_file:
        users = json.load(users_file)
    with open('/etc/tinyproxy/tinyproxy.conf') as proxy_config_file:
        proxy_config = proxy_config_file.readlines()
    proxy_config_lines = [line.rstrip() for line in proxy_config]
    upgrade_with_configs(proxy_config_lines, config, users)
    shutil.copyfile('/etc/tinyproxy/tinyproxy.conf', '/etc/tinyproxy/tinyproxy.conf.backup')
    with open('/etc/tinyproxy/tinyproxy.conf', 'w') as f:
        for item in proxy_config_lines:
            f.write("%s\n" % item)
    print('** LightProxy server (tinyproxy) configured. **')


if __name__ == '__main__':
    main()
