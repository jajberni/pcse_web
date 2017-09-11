# -*- coding: utf-8 -*-
# Copyright (c) 2004-2016 Alterra, Wageningen-UR
# Allard de Wit (allard.dewit@wur.nl), December 2016
"""
The Python Crop Simulation Environment (PCSE) has been developed
to facilitate implementing crop simulation models that were
developed in Wageningen. PCSE provides a set of building blocks
that on the one hand facilitates implementing the crop simulation
models themselves and other hand allows to interface these models with
external inputs and outputs (files, databases, webservers)

PCSE builds on existing ideas implemented in the FORTRAN
Translator (FST) and its user interface FSE. It inherits ideas
regarding the rigid distinction between rate calculation
and state integration and the initialization of parameters
in a PCSE model. Moreover PCSE provides support for reusing
input files and weather files that are used by FST models.

PCSE currently provides an implementation of the WOFOST and LINTUL crop
simulation models and variants of WOFOST with extended
capabilities.

See Also
--------
* http://www.wageningenur.nl/wofost
* http://github.com/ajwdewit/pcse
* http://pcse.readthedocs.org
"""
from __future__ import print_function
__author__ = "Allard de Wit <allard.dewit@wur.nl>"
__license__ = "European Union Public License"
__stable__ = False
__version__ = "5.3.1b"

import sys, os
from . import util
import logging.config
from .settings import settings
logging.config.dictConfig(settings.LOG_CONFIG)

from . import db
from . import fileinput
from . import agromanager
from . import soil
from . import crop


if not __stable__:
    print("Warning: You are running a PCSE development version:  %s" % __version__)


def test():
    """Run all available tests for PCSE."""
    tests.test_all()
