# coding: utf-8
# pylint: disable=too-few-public-methods, no-self-use, missing-docstring, unused-argument
"""
Provides API logic relevant to users
"""
from flask_restful import reqparse, Resource

import auth
import util

from main import API, auth
from model import User, UserValidator
import model
from api.helpers import ArgumentValidator, make_list_response, make_empty_ok_response, make_bad_request_exception
from flask import request, g, abort
from pydash import _
from api.decorators import model_by_key, user_by_username, authorization_required, admin_required, login_required
from flask_restful import inputs
from google.appengine.ext import ndb #pylint: disable=import-error

import cloudstorage as gcs
from config import GCS_BUCKET

import os.path

from google.appengine.api import images
from google.appengine.ext import blobstore

@API.resource('/api/v1/upload/<string:category>/<string:name>')
class UploadMediaAPI(Resource):
    @login_required
    def get(self,category,name):
        """Returns a link to an uploaded resource"""
        # TODO permissions, how, what?
        adr =  GCS_BUCKET + '/' + category + '/' + name
        blob_key = blobstore.create_gs_key('/gs' + adr)
        img_url = images.get_serving_url(blob_key=blob_key)
        return img_url

    @login_required
    def post(self,category,name):
        """Saves a resource in the cloud storage

        Multiple files are possible, if multiple files are uploaded the 'name' needs to be 'multiple'.
        For multiple files the file name is take as name.
        If multiple fils are uploaded without 'multiple' only the last file is saved.
        The function can also gerenate a serving link, this is either public or private (not guessable).

        If category or name (without extension) is a user key it needs to belong to the loged in user.
        """
        link =  request.form.get('link',default='private') # either public, private or False
        gcs_links = []
        api_links = []
        private_links = []
        links = []
        print "Category: "+str(category)
        try:
            category_key = ndb.Key(urlsafe=category)
        except:
            category_key = False

        for k,f in request.files.iteritems(multi=False):
            if name == 'multiple':
                name = f.filename
            try:
                name_key = ndb.Key(urlsafe=os.path.splitext(os.path.basename(name))[0])
            except:
                name_key = False

            if category_key or name_key:
                user_key = category_key or name_key
                if not auth.is_authorized(user_key):
                    return abort(403)


            write_retry_params = gcs.RetryParams(backoff_factor=1.1)
            adr =  "{}/{}/{}".format(GCS_BUCKET, category, name)
            gcs_file = gcs.open(adr, 'w',
              content_type=f.mimetype,
              options={
                'x-goog-meta-name': f.filename
                    },
             retry_params=write_retry_params)
            f.save(gcs_file) # saves file to cloud storage
            gcs_file.close()
            f.close()
            gcs_links.append("/_ah/gcs"+adr)
            api_links.append("/api/v1/upload/"+ category + '/' + name)
            links.append("/resource/"+ '/' + category + '/' + name)
            if link == 'private': #TODO implement public links
                blob_key = blobstore.create_gs_key('/gs' + adr)
                img_url = images.get_serving_url(blob_key=blob_key)
                private_links.append(img_url)


        return {'links': links,
                'private_links': private_links,
                'gcs_links': gcs_links,
                'api_links': api_links
                }
        #return make_empty_ok_response()


