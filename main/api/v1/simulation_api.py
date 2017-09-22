# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
from flask_restful import reqparse, Resource

import auth
import util

from main import API
from model import Simulation, SimulationValidator
from api.helpers import ArgumentValidator, make_list_response,\
        make_empty_ok_response, default_parser, to_compare_date
from flask import request, g
from pydash import _
from api.decorators import model_by_key, simulation_by_name, authorization_required, admin_required, login_required


@API.resource('/api/v1/simulations')
class SimulationsAPI(Resource):
    """Gets list of simulations. Uses ndb Cursor for pagination. Obtaining simulations is executed
    in parallel with obtaining total count via *_async functions
    """
    def get(self):
        parser = default_parser()
        args = parser.parse_args()
        compare, date = to_compare_date(args.newer, args.older, args.orderBy)

        sim_query = Simulation.qry(order_by_date=args.orderBy, compare_date=compare, date=date, time_offset=args.offset)
        sim_future = sim_query.fetch_page_async(args.size, start_cursor=args.cursor)

        total_count_future = sim_query.count_async(keys_only=True) if args.total else False
        simulations, next_cursor, more = sim_future.get_result()
        simulations = [s.to_dict(include=Simulation.get_public_properties()) for s in simulations]
        total_count = total_count_future.get_result() if total_count_future else False
        return make_list_response(simulations, next_cursor, more, total_count)

    @login_required
    def post(self):
        data = request.json
        print("POST: Received simulation data: ", data)
        sim = Simulation(**data)
        sim.update_simulation_results()
        sim.owner_id = auth.current_user_db().username
        sim.put()
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()

        return sim.to_dict(include=properties)

    @login_required
    def put(self):
        data = request.json
        print("PUT: Received simulation data: ", data)
        sim = Simulation(**data)
        sim.update_simulation_results()
        sim.owner_id = auth.current_user_db().username
        sim.put()
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()

        return sim.to_dict(include=properties)


@API.resource('/api/v1/simulations/<string:name>')
class SimulationByUsernameAPI(Resource):
    @simulation_by_name
    def get(self, name):
        """Loads user's properties. If logged user is admin it loads also non public properties"""
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()
        return g.simulation_db.to_dict(include=properties)


@API.resource('/api/v1/simulations/<string:key>')
class SimulationByKeyAPI(Resource):
    @authorization_required
    @model_by_key
    def put(self, key):
        """Updates simulation's properties"""
        update_properties = ['name', 'description', 'location', 'soil_attributes', 'start_date', 'end_date',
                             'crop_attributes', 'site_attributes', 'amgt_attributes', 'crop_name', 'sowing_date']
        if auth.is_admin():
            update_properties += ['owner_id']

        new_data = _.pick(request.json, update_properties)
        print("SAVE PUT: Received simulation data: ", new_data)
        g.model_db.populate(**new_data)
        # TODO: If location changes, then retrieve NASA weather again
        g.model_db.update_simulation_results()
        g.model_db.put()
        #return make_empty_ok_response()
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()
        print("SAVE PUT: done!")
        return g.model_db.to_dict(include=properties)

    @authorization_required
    @model_by_key
    def post(self, key):
        """Updates simulation's properties"""
        update_properties = ['name', 'description', 'location', 'soil_attributes', 'start_date', 'end_date',
                             'crop_attributes', 'site_attributes', 'amgt_attributes', 'crop_name', 'sowing_date']
        if auth.is_admin():
            update_properties += ['owner_id']

        new_data = _.pick(request.json, update_properties)
        print("SAVE POST: Received simulation data: ", new_data)
        g.model_db.populate(**new_data)
        try:
          g.model_db.update_simulation_results()
          g.model_db.put()
        except Exception as ex:
          print(ex)
        #return make_empty_ok_response()
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()
        return g.model_db.to_dict(include=properties)

    @admin_required
    @model_by_key
    def delete(self, key):
        """Deletes user"""
        g.model_key.delete()
        return make_empty_ok_response()


@API.resource('/api/v1/simulations/new')
class SimulationNew(Resource):
    def get(self):
        new_sim = Simulation(name='New Simulation')
        properties = Simulation.get_public_properties()
        return new_sim.to_dict(include=properties)
