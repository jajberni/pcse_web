# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API for crop defaults
"""
from flask_restful import Resource
from flask import jsonify, make_response
from main import API
from model.crop_defaults import default_crops


@API.resource('/api/v1/crops')
class CropList(Resource):
    def get(self):
      return jsonify(default_crops=default_crops.keys())

@API.resource('/api/v1/crops/<string:name>')
class CropDefaults(Resource):
    def get(self, name):
      if name in default_crops:
        print(default_crops[name])
        return jsonify(crop=default_crops[name])
      else:
        return make_response(jsonify(error='Invalid crop'), 401)
