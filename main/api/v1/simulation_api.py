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
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required


@API.resource('/api/v1/simulations')
class SimulationsAPI(Resource):
    """Gets list of simulations. Uses ndb Cursor for pagination. Obtaining simulatons is executed
    in parallel with obtaining total count via *_async functions
    """
    def get(self):
        parser = default_parser()
        args = parser.parse_args()
        compare, date = to_compare_date(args.newer, args.older, args.orderBy)

        users_query = Simulation.qry(order_by_date=args.orderBy, compare_date=compare, date=date, time_offset=args.offset)
        users_future = users_query.fetch_page_async(args.size, start_cursor=args.cursor)

        total_count_future = users_query.count_async(keys_only=True) if args.total else False
        simulations, next_cursor, more = users_future.get_result()
        simulations = [s.to_dict(include=Simulation.get_public_properties()) for s in simulations]
        total_count = total_count_future.get_result() if total_count_future else False
        return make_list_response(simulations, next_cursor, more, total_count)


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
class UserByKeyAPI(Resource):
    @authorization_required
    @model_by_key
    def put(self, key):
        """Updates simulation's properties"""
        update_properties = ['name', 'description', 'location',
                         'soil_attributes', 'sowing_date', 'tsum1', 'tsum2']
        if auth.is_admin():
            update_properties += ['owner_id']

        new_data = _.pick(request.json, update_properties)
        g.model_db.populate(**new_data)
        g.model_db.put()
        #return make_empty_ok_response()
        if auth.is_admin():
            properties = Simulation.get_private_properties()
        else:
            properties = Simulation.get_public_properties()
        return g.model_db.to_dict(include=properties)

    @authorization_required
    @model_by_key
    def post(self, key):
        """Updates user's properties"""
        update_properties = ['name', 'description', 'location',
                         'soil_attributes', 'sowing_date', 'tsum1', 'tsum2']
        if auth.is_admin():
            update_properties += ['owner_id']

        new_data = _.pick(request.json, update_properties)
        g.model_db.populate(**new_data)
        g.model_db.put()
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


