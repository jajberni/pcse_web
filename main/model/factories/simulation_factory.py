# pylint: disable=no-init, old-style-class
"""Provides implementation of UserFactory"""

from base_factory import BaseFactory
from model import Simulation
from factory.fuzzy import FuzzyText, FuzzyChoice
import factory
import util
import random

class SimulationFactory(BaseFactory):
    """Factory for creating mock users"""
    class Meta: # pylint: disable=missing-docstring
        model = Simulation

    name = factory.Sequence(lambda n: 'sim%d' % n)
    description = FuzzyText()
    tsum1 = random.randint(700, 999)
    tsum2 = random.randint(700, 999)

    location_lat = random.randint(35, 37)
    location_lon = random.randint(-4, 1)
    location = "37.7, -4.88"



    @classmethod
    def create_batch(cls, size, **kwargs):
        """When creating batch, we create one less than requested size and then add admin user
        at the end"""
        super(SimulationFactory, cls).create_batch(size - 1, **kwargs)
