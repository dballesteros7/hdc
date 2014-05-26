#!/usr/bin/python2.7
import os
import shutil
import sys
import tempfile
import pwd
import grpmodule
import getpass


def replace(file_path, pattern, subst):
    # Create temp file
    fh, abs_path = tempfile.mkstemp()
    new_file = open(abs_path, 'w')
    old_file = open(file_path)
    for line in old_file:
        new_file.write(line.replace(pattern, subst))
    # close temp file
    new_file.close()
    os.close(fh)
    old_file.close()
    # Remove original file
    os.remove(file_path)
    # Move new file
    shutil.move(abs_path, file_path)

def get_hdc_directory_path():
    hdc_directory = os.path.abspath(os.path.join(__file__, os.pardir, os.pardir, 'config-files'))
    print 'Is this the path to the clone of the source code?'
    s = raw_input('%s [Y/N] ' % hdc_directory)
    if s.lower() == 'n':
        s2 = raw_input('Please provide the full path to the hdc clone: ')
        if not s2 or not os.path.isdir(s2):
            print 'This is not a valid directory in your system.\n'
            return get_hdc_directory_path()
        else:
            return s2
    elif s.lower() == 'y':
        return hdc_directory
    else:
        print 'Please enter Y or N.\n'
        return get_hdc_directory_path()

def get_output_config_directory():
    config_files_default = os.path.join(os.environ['HOME'], 'hdc', 'config-files')
    print 'Where would you like to deploy the compiled configuration files:'
    print 'Our recommended location is: %s' % config_files_default
    s = raw_input('Is this ok? [Y/N]: ')
    if s.lower() == 'y':
        if not os.path.isdir(config_files_default):
            try:
                os.makedirs(config_files_default, mode=0755)
            except IOError:
                print 'Could not create the config data directory. Please try again.\n'
                return get_output_config_directory()
            else:
                return config_files_default
        else:
            return config_files_default
    elif s.lower() == 'n':
        s2 = raw_input('Please provide the full path to the desired directory: ')
        if not s2:
            print 'This is not a valid path.\n'
            return get_output_config_directory()
        elif not os.path.exists(s2):
            print 'Directory does not exist, we will attempt to create it.'
            try:
                os.makedirs(s2, mode=0755)
            except IOError:
                print 'Could not create the specified directory.\n'
                return get_output_config_directory()
            else:
                return s2
        elif not os.path.isdir(s2):
            print 'This is not a valid directory.\n'
            return get_output_config_directory()
        else:
            return s2
    else:
        print 'Please enter Y or N.\n'
        return get_output_config_directory()

def get_mongodb_data_dir():
    default_mongodb_data = os.path.join(os.environ['HOME'], 'hdc', 'mongodb')
    print 'Please specify the data directory for MongoDB'
    print 'Our recommendation is: %s' % default_mongodb_data
    s = raw_input('Is this ok? [Y/N]: ')
    if s.lower() == 'y':
        if not os.path.isdir(default_mongodb_data):
            try:
                os.makedirs(default_mongodb_data, mode=0755)
            except IOError:
                print 'Could not create the mongodb data directory. Please try again.\n'
                return get_mongodb_data_dir()
            else:
                return default_mongodb_data
        else:
            return default_mongodb_data
    elif s.lower() == 'n':
        s2 = raw_input('Please provide the full path to the desired directory: ')
        if not s2:
            print 'This is not a valid path.\n'
            return get_mongodb_data_dir()
        elif not os.path.exists(s2):
            print 'Directory does not exist, we will attempt to create it.'
            try:
                os.makedirs(s2, mode=0755)
            except IOError:
                print 'Could not create the specified directory.\n'
                return get_mongodb_data_dir()
            else:
                return s2
        elif not os.path.isdir(s2):
            print 'This is not a valid directory.\n'
            return get_mongodb_data_dir()
        else:
            return s2
    else:
        print 'Please enter Y or N.\n'
        return get_mongodb_data_dir()

def get_lighttpd_dir():
    default_lighttpd = os.path.join(os.environ['HOME'], 'hdc', 'lighttpd')
    print 'Please specify the directory for lighttpd'
    print 'Our recommendation is: %s' % default_lighttpd
    s = raw_input('Is this ok? [Y/N]: ')
    if s.lower() == 'y':
        if not os.path.isdir(default_lighttpd):
            try:
                os.makedirs(default_lighttpd, mode=0755)
            except IOError:
                print 'Could not create the lighttpd directory. Please try again.\n'
                return get_lighttpd_dir()
            else:
                return default_lighttpd
        else:
            return default_lighttpd
    elif s.lower() == 'n':
        s2 = raw_input('Please provide the full path to the desired directory: ')
        if not s2:
            print 'This is not a valid path.\n'
            return get_lighttpd_dir()
        elif not os.path.exists(s2):
            print 'Directory does not exist, we will attempt to create it.'
            try:
                os.makedirs(s2, mode=0755)
            except IOError:
                print 'Could not create the specified directory.\n'
                return get_lighttpd_dir()
            else:
                return s2
        elif not os.path.isdir(s2):
            print 'This is not a valid directory.\n'
            return get_lighttpd_dir()
        else:
            return s2
    else:
        print 'Please enter Y or N.\n'
        return get_lighttpd_dir()

def get_user_and_groups():
    user = getpass.getuser()
    groups = [g.gr_name for g in grpmodule.getgrall() if user in g.gr_mem]
    gid = pwd.getpwnam(user).pw_gid
    groups.append(grpmodule.getgrgid(gid).gr_name)
    return user, groups

def get_lighttpd_user_group():
    user, groups = get_user_and_groups()
    print 'Please select the user and group to use for the lighttpd server'
    print 'Our recommendation is: %s:%s' % (user, groups[0])
    s = raw_input('Is this ok? [Y/N]: ')
    if s.lower() == 'y':
        return user, groups[0]
    elif s.lower() == 'n':
        s2 = raw_input('Please provide the user and group, using : as separator, no spaces.')
        if not s2:
            print 'Not a valid user/group.\n'
            return get_lighttpd_user_group()
        else:
            tokens = s2.split(':', 1)
            if len(tokens) != 2:
                print 'Not a valid user/group, make sure you use no spaces and : as separator.\n'
                return get_lighttpd_user_group()
            else:
                user = tokens[0]
                group = tokens[1]
                return user, group
    else:
        print 'Please enter Y or No.\n'
        return get_lighttpd_user_group()

def process_mongodb_config(src_dir, output_dir):
    config_file_path = os.path.join(src_dir, 'mongod.conf')
    shutil.copy(config_file_path, output_dir)
    output_file_path = os.path.join(output_dir, 'mongod.conf')
    mongo_data_dir = get_mongodb_data_dir()
    mongo_db_dir = os.path.join(mongo_data_dir, 'db')
    mongo_db_log = os.path.join(mongo_data_dir, 'mongod.out')
    if not os.path.exists(mongo_db_dir):
        os.mkdir(mongo_db_dir)
    replace(output_file_path, 'MONGODB_DATA_PATH', mongo_db_dir)
    replace(output_file_path, 'MONGODB_LOG_OUT', mongo_db_log)

def process_lighttpd_config(src_dir, output_dir):
    config_file_path = os.path.join(src_dir, 'lighttpd.conf')
    shutil.copy(config_file_path, output_dir)
    output_file_path = os.path.join(output_dir, 'lighttpd.conf')
    lighttpd_data_dir = get_lighttpd_dir()
    lighttpd_visualizations_dir = os.path.join(lighttpd_data_dir, 'visualizations')
    lighttpd_apps_dir = os.path.join(lighttpd_data_dir, 'apps')
    if not os.path.exists(lighttpd_visualizations_dir):
        os.mkdir(lighttpd_visualizations_dir)
    if not os.path.exists(lighttpd_apps_dir):
        os.mkdir(lighttpd_apps_dir)
    replace(output_file_path, 'LIGHTTPD_DOCUMENT_ROOT', lighttpd_data_dir)
    user, group = get_lighttpd_user_group()
    replace(output_file_path, 'LIGHTTPD_USER', user)
    replace(output_file_path, 'LIGHTTPD_GROUP', group)

def process_elasticsearch_config(src_dir, output_dir):
    config_file_path = os.path.join(src_dir, 'elasticsearch.yml')
    shutil.copy(config_file_path, output_dir)

def configure():
    print '======================================================='
    print 'Welcome to the configuration utility for HDC developers'
    print '======================================================='
    print
    print 'We will guide you through a few configuration options to install'
    print 'the correct configuration files for your current environment.'
    print '................................................................'
    hdc_directory = get_hdc_directory_path()
    print
    hdc_config_directory = get_output_config_directory()
    process_mongodb_config(hdc_directory, hdc_config_directory)
    process_lighttpd_config(hdc_directory, hdc_config_directory)
    process_elasticsearch_config(hdc_directory, hdc_config_directory)
if __name__ == '__main__':
    sys.exit(configure())
