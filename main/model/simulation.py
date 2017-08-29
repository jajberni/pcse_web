# coding: utf-8
"""Provides implementation of Simulation model and Simulation"""
from __future__ import absolute_import

from google.appengine.ext import ndb
import model
import util


from pcse.db import NASAPowerWeatherDataProvider
from pcse.fileinput import CABOFileReader
from pcse.base_classes import ParameterProvider
from pcse.models import Wofost71_WLP_FD

import yaml

import os.path as osp


class SimulationValidator(model.BaseValidator):
    """Defines how to create validators for simulation properties. For detailed description see BaseValidator"""
    name = [1, 100]
    description = [3, 400]
    latlon = [-180, 180]
    tsum = [0, 2000]

    @classmethod
    def existing_name(cls, name):
        """Validates if given name is in datastore"""
        simulation_db = Simulation.get_by('name', name)
        if not simulation_db:
            raise ValueError('This name is not in our database.')
        return name

    @classmethod
    def unique_name(cls, name):
        """Validates if given name is not in datastore"""
        simulation_db = Simulation.get_by('name', name)
        if simulation_db:
            raise ValueError('Sorry, this name is already taken.')
        return name


class Simulation(model.Base):
    """A class describing datastore users."""
    name = ndb.StringProperty(default='', validator=SimulationValidator.create('name'))
    description = ndb.StringProperty(required=True, validator=SimulationValidator.create('description'))
    location = ndb.GeoPtProperty(required=True)
    soil_attributes = ndb.JsonProperty(required=True)
    sowing_date = ndb.DateProperty(required=True)
    end_date = ndb.DateProperty(requred=True)
    tsum1 = ndb.FloatProperty(default=900.0)
    tsum2 = ndb.FloatProperty(default=900.0)
    owner_id = ndb.StringProperty(default='')
    output_dataframe = None

    PUBLIC_PROPERTIES = ['name', 'description', 'location',
                         'soil_attributes', 'sowing_date', 'tsum1', 'tsum2']

    PRIVATE_PROPERTIES = ['owner_id']

    def run_simulation(self):
        wdp = NASAPowerWeatherDataProvider(self.location.lat, self.location.lon)
        amgt = yaml.load(open(osp.join("sim_data", "wofost_npk.amgt")))['AgroManagement']
        soil = CABOFileReader(open(osp.join("sim_data", "wofost_npk.soil")))
        site = CABOFileReader(open(osp.join("sim_data", "wofost_npk.site")))
        crop = CABOFileReader(open(osp.join("sim_data", "wofost_npk.crop")))

        amgt[0][amgt[0].keys()[0]]['CropCalendar']['crop_start_date'] = self.sowing_date.date()
        amgt[0][amgt[0].keys()[0]]['CropCalendar']['crop_end_date'] = self.end_date.date()

        parvalues = ParameterProvider(sitedata=site, soildata=soil, cropdata=crop)
        crop['TSUM1'] = self.tsum1
        crop['TSUM2'] = self.tsum2
        wofsim = Wofost71_WLP_FD(parvalues,  wdp, agromanagement=amgt)
        wofsim.run_till_terminate()
        output = wofsim.get_output()
        self.output_dataframe = pd.DataFrame(output)

    @classmethod
    def qry(cls, name=None, **kwargs):
        """Query for way points"""
        #qry = cls.query(**kwargs)
        qry = model.Base.qry(model.Simulation, **kwargs)
        if name:
            qry = qry.filter(cls.name == name)
        #else filter for private True and False
        return qry



