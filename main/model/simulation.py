# coding: utf-8
"""Provides implementation of Simulation model and Simulation"""
from __future__ import absolute_import

from google.appengine.ext import ndb
from google.appengine.ext.ndb.model import GeoPt
import model
import util

from pcse.db import NASAPowerWeatherDataProvider
from pcse.fileinput import CABOFileReader
from pcse.base_classes import ParameterProvider
from pcse.models import Wofost71_WLP_FD
import datetime as dt
import json
from dateutil.parser import parse
import yaml

from .model_defaults import default_amgt, default_crop, default_site, default_soil

soil_defaults = {'SMW': 0.3, 'SMFCF': 0.46, 'SM0': 0.57, 'CRAIRC': 0.05, 'RDMSOL': 0.45}

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

def is_date(prop, value):
  print("Got date: ", value)
  if isinstance(value, dt.date):
    return value
  elif isinstance(value, dt.datetime):
    return value
  else:
    o = parse(value).date()
    return o

def is_geoPt(prop, value):
  if isinstance(value, GeoPt):
    return value
  else:
    print("Got: ", value)
    pt = GeoPt(value.lat, value.lon)
    return pt


class StringDateProperty(ndb.DateProperty):
  def _validate(self, value):
    print("Date validation: ", value)
    if isinstance(value, basestring):
      o = parse(value).date()
      return o


class DictGeoPt(ndb.GeoPtProperty):
  def _validate(self, value):
    if isinstance(value, dict):
      pt = GeoPt(value['lat'], value['lon'])
      return pt


class Simulation(model.Base):
  """A class describing datastore users."""
  name = ndb.StringProperty(required=True, validator=SimulationValidator.create('name'))
  description = ndb.StringProperty(default="Demo simulation", validator=SimulationValidator.create('description'))
  location = DictGeoPt(default=GeoPt(37.4, -4.03))
  soil_attributes = ndb.JsonProperty(default=soil_defaults)
  start_date = StringDateProperty(default=dt.date(2014, 9, 1))
  sowing_date = StringDateProperty(default=dt.date(2014, 10, 1))
  end_date = StringDateProperty(default=dt.date(2015, 7, 1))
  crop_name = ndb.StringProperty(default='wheat')
  tsum1 = ndb.FloatProperty(default=900.0)
  tsum2 = ndb.FloatProperty(default=900.0)
  owner_id = ndb.StringProperty(default='')
  simulation_output = ndb.JsonProperty(default={})
  results_ok = ndb.BooleanProperty(default=False)
  simulation_dict = {}

  PUBLIC_PROPERTIES = ['name', 'description', 'location', 'results_ok', 'simulation_output',
                       'soil_attributes', 'start_date', 'sowing_date', 'end_date', 'crop_name', 'tsum1', 'tsum2']

  PRIVATE_PROPERTIES = ['owner_id']

  def __init__(self,  *args, **kwargs):
    super(Simulation, self).__init__(*args, **kwargs)
    print(self.results_ok)
    if self.results_ok is False:
      print('We need to run simulation for this one')
      #self._update_simulation_results()

  @ndb.transactional
  def _update_simulation_results(self):
    json_data = json.dumps(self.run_simulation(), default=json_serial)
    self.simulation_output = json_data
    self.results_ok = True

  def plot_dict(self):
    ts = self.simulation_dict.keys()
    lai = [v['LAI'] for v in self.simulation_output.itervalues()]
    sm = [v['SM'] for v in self.simulation_output.itervalues()]
    plot_data = json.dumps([
      {'key': "LAI", "values": {"x": ts, "y": lai}},
      {'key': "SM", "values": {"x": ts, "y": sm}}], default=json_serial)

    return plot_data

  def run_simulation(self):
    print("Fetching NASA weather...")
    wdp = NASAPowerWeatherDataProvider(self.location.lat, self.location.lon)
    print(wdp)
    amgt = default_amgt
    soil = default_soil
    site = default_site
    crop = default_crop

    amgt[0][self.start_date] = amgt[0].pop(amgt[0].keys()[0])

    amgt[0][self.start_date]['CropCalendar']['crop_start_date'] = self.sowing_date
    amgt[0][self.start_date]['CropCalendar']['crop_end_date'] = self.end_date

    parvalues = ParameterProvider(sitedata=site, soildata=soil, cropdata=crop)
    crop['TSUM1'] = self.tsum1
    crop['TSUM2'] = self.tsum2
    wofsim = Wofost71_WLP_FD(parvalues, wdp, agromanagement=amgt)
    wofsim.run_till_terminate()
    output = wofsim.get_output()

    results_dict = {}
    for a in output:
        results_dict[a.pop('day').isoformat()] = a
    self.simulation_dict = results_dict
    return results_dict

  @classmethod
  def qry(cls, name=None, **kwargs):
    """Query for simulations"""
    # qry = cls.query(**kwargs)
    qry = model.Base.qry(model.Simulation, **kwargs)
    if name:
      qry = qry.filter(cls.name == name)
    # else filter for private True and False
    return qry


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (dt.datetime, dt.date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))
