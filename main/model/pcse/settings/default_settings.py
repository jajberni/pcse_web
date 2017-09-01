# -*- coding: utf-8 -*-
# Copyright (c) 2004-2014 Alterra, Wageningen-UR
# Allard de Wit (allard.dewit@wur.nl), April 2014
"""Settings for PCSE

Default values will be read from the files 'pcse/settings/default_settings.py'
User specific settings are read from '$HOME/.pcse/user_settings.py'. Any
settings defined in user settings will override the default settings

Setting must be defined as ALL-CAPS and can be accessed as attributes
from pcse.settings.settings

For example, to use the settings in a module under 'crop':

    from ..settings import settings
    print settings.METEO_CACHE_DIR

Settings that are not ALL-CAPS will generate a warning. To avoid warnings
for everything that is not a setting (such as imported modules), prepend
and underscore to the name.
"""


# Location for meteo cache files
METEO_CACHE_DIR = "meteo_cache"

# Do range checks for meteo variables
METEO_RANGE_CHECKS = True

# PCSE sets all rate variables to zero after state integration for consistency.
# You can disable this behaviour for increased performance.
ZEROFY = True

# Configuration of logging
# The logging system of PCSE consists of two log handlers. One that sends log messages
# to the screen ('console') and one that sends message to a file. The location and name of
# the log is defined by LOG_DIR and LOG_FILE_NAME. Moreover, the console and file handlers
# can be given a log level as defined LOG_LEVEL_FILE and LOG_LEVEL_CONSOLE. By default
# these levels are INFO and WARNING meaning that log message of INFO and up are sent to
# file and WARNING and up are send to the console. For detailed log messages the log
# level can be set to DEBUG but this will generate a large number of logging messages.
#
# Log files can become 1Mb large. When this file size is reached a new file is opened
# and the old one is renamed. Only the most recent 7 log files are retained to avoid
# getting large log file sizes.

LOG_LEVEL_CONSOLE = "INFO"
LOG_CONFIG = \
            {
                'version': 1,
                'formatters': {
                    'standard': {
                        'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
                    },
                    'brief': {
                        'format': '[%(levelname)s] - %(message)s'
                    },
                },
                'handlers': {
                    'console': {
                        'level':LOG_LEVEL_CONSOLE,
                        'class':'logging.StreamHandler',
                        'formatter':'brief'
                    },
                },
                'root': {
                         'handlers': ['console'],
                         'propagate': True,
                         'level':'NOTSET'
                }
            }
