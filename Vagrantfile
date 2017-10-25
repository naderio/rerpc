# -*- mode: ruby -*-
# vi: set ft=ruby :
VAGRANT_COMMAND = ARGV[0]

VAGRANT_HOSTNAME = ENV['VAGRANT_HOSTNAME'] || "rerpc";
VAGRANT_USERNAME = ENV['VAGRANT_USERNAME'] || "deploy";

# VAGRANT_INTERFACE = ENV['VAGRANT_INTERFACE'] || "wlan0";
# VAGRANT_IP = ENV['VAGRANT_IP'] || "192.168.1.100";

Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/xenial64"

  # config.vm.network "public_network", bridge: VAGRANT_INTERFACE, ip: VAGRANT_IP

  config.vm.network "forwarded_port", guest: 5858, host: 5858 # Node.js Legacy Debugges
  config.vm.network "forwarded_port", guest: 9229, host: 9229 # Node.js Inspector (Chrome DevTools)
  config.vm.network "forwarded_port", guest: 5000, host: 5000 # Application

  config.vm.hostname = VAGRANT_HOSTNAME

  config.vm.provider "virtualbox" do |v|
    v.name = VAGRANT_HOSTNAME
  end

  if VAGRANT_COMMAND == "ssh" || VAGRANT_COMMAND == "ssh-config"
    # config.ssh.host = VAGRANT_IP
    # config.ssh.port = 22
    config.ssh.username = VAGRANT_USERNAME
  end

  config.vm.synced_folder ".", "/data"

  config.vm.provision "shell", inline: <<-SHELL

set -x

adduser #{VAGRANT_USERNAME} <<-EOM
#{VAGRANT_USERNAME}
#{VAGRANT_USERNAME}
#{VAGRANT_USERNAME}



Y

EOM

echo '%sudo ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/01-sudo

usermod -aG ubuntu,adm,sudo #{VAGRANT_USERNAME}

cp -R /home/ubuntu/.ssh /home/#{VAGRANT_USERNAME}/
chown -R #{VAGRANT_USERNAME}:#{VAGRANT_USERNAME} /home/#{VAGRANT_USERNAME}/.ssh

apt-get install -y build-essential python

curl -sL https://deb.nodesource.com/setup_8.x | bash
apt-get install -y nodejs

chown -R #{VAGRANT_USERNAME}:#{VAGRANT_USERNAME} /usr

npm install -g localtunnel

SHELL

end
