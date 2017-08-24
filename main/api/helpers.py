# coding: utf-8
"""
Set of helper function used throughout the REST API
"""
from google.appengine.datastore.datastore_query import Cursor #pylint: disable=import-error
from google.appengine.api import urlfetch #pylint: disable=import-error
import logging

import flask_restful as restful
from werkzeug import exceptions
import flask
import model
from main import config
import urllib
from flask import request
import json


class Api(restful.Api): # pylint: disable=too-few-public-methods
    """By extending restful.Api class we can make custom implementation of some of its methods"""

    def handle_error(self, err):
        """Specifies error handler for REST API.
        It is called when exception is raised during request processing

        Args:
            err (Exception): the raised Exception object

        """
        return handle_error(err)


def handle_error(err):
    """This error handler logs exception and then makes response with most
    appropriate error message and error code

    Args:
        err (Exception): the raised Exception object

    """
    logging.exception(err)
    message = ''
    if hasattr(err, 'data') and err.data['message']:
        message = err.data['message']
    elif hasattr(err, 'message') and err.message:
        message = err.message
    elif hasattr(err, 'description'):
        message = err.description
    try:
        err.code
    except AttributeError:
        err.code = 500
    return flask.jsonify({
        'message': message
    }), err.code


def make_not_found_exception():
    """Raises 404 Not Found exception

    Raises:
        HTTPException: with 404 code
    """
    raise exceptions.NotFound()


def make_bad_request_exception(message):
    """Raises 400 Bad request exception

    Raises:
        HTTPException: with 400 code
    """
    raise exceptions.BadRequest(message)


def make_empty_ok_response():
    """Returns OK response with empty body"""
    return '', 204


def make_list_response(reponse_list, cursor=None, more=False, total_count=None):
    """Creates reponse with list of items and also meta data useful for pagination

    Args:
        reponse_list (list): list of items to be in response
        cursor (Cursor, optional): ndb query cursor
        more (bool, optional): whether there's more items in terms of pagination
        total_count (int, optional): Total number of items

    Returns:
        dict: response to be serialized and sent to client
    """
    return {
        'list': reponse_list,
        'meta': {
            'nextCursor': cursor.urlsafe() if cursor else None,
            'more': more,
            'totalCount': total_count
        }
    }

def default_parser():
    """ Creates a default parser with seven arguments:
        cursor, total, size, orderBy (see model.Base),
        newer or older (date string), and offset
        (offset to newer or older in seconds).
    Returns:
        parser object.

    Example:
        parser = default_parser()
        args = parser.parse_args()

    """
    parser = restful.reqparse.RequestParser()
    parser.add_argument('cursor', type=ArgumentValidator.create('cursor'))
    parser.add_argument('size', type=int, default=10)
    parser.add_argument('total', type=ArgumentValidator.create('boolTrue'),default=False)
    parser.add_argument('orderBy', type=str, default=None)
    parser.add_argument('newer', type=str, default=None)
    parser.add_argument('older', type=str, default=None)
    parser.add_argument('offset', type=str, default=None)
    return parser

def to_compare_date(newer,older, orderBy='modified'):
    """ Translates newer and older values to a compare_date
    and a date, depending on the oderBy value.
    Only newer older older can be set, newer is taken if both
    are set.

    Parameters:
        newer: date string or timedate object
        older: date string or timedate object

    Returns:
        (compare_date, date)
    """
    compare = None
    date = None
    if newer and orderBy:
        compare = ">="+orderBy.replace("-","")
        date = newer
    elif older and orderBy:
        compare = "<="+orderBy.replace("-","")
        date = older
    return (compare, date)

class ArgumentValidator(model.BaseValidator):
    """This validator class contains attributes and methods for validating user's input,
    which is not associated with any particular datastore model, but still needs
    to be validated

    Attributes:
      feedback (list): determining min and max lengths of feedback message sent to admin

    """
    feedback = [1, 2000]

    @classmethod
    def captcha(cls, captcha):
        """Verifies captcha by sending it to google servers

        Args:
            captcha (string): captcha string received from client.

        Returns:
            bool: True if successful

        Raises:
           ValueError: If captcha is incorrect
        """
        if not config.CONFIG_DB.has_recaptcha:
            return True

        params = {
            'secret': config.CONFIG_DB.recaptcha_private_key,
            'remoteip': request.remote_addr,
            'response': captcha
        }
        params = urllib.urlencode(params)
        result = urlfetch.fetch(url='https://www.google.com/recaptcha/api/siteverify',
                                payload=params,
                                method=urlfetch.POST,
                                headers={'Content-Type': 'application/x-www-form-urlencoded'})
        success = json.loads(result.content)['success']
        if not success:
            raise ValueError('Sorry, incorrect captcha')
        return True

    @classmethod
    def cursor(cls, cursor):
        """Verifies if given string is valid ndb query cursor
        if so returns instance of it

        Args:
            cursor (string): Url encoded ndb query cursor

        Returns:
            google.appengine.datastore.datastore_query.Cursor: ndb query cursor

        Raises:
           ValueError: If captcha is incorrect
        """
        if not cursor:
            return None
        return Cursor(urlsafe=cursor)

    @classmethod
    def bool(cls, arg, default=True):
        """Verifies if given argument is a boolean value.

        Args:
            arg (string): String with boolean value (1, true, TRUE, and so on)

        Returns:
            bool (True or False)

        Do not use this directely together with ArgumentValidator.create(str),
        use the functions below for this.
        """
        arg = default if arg == "" else arg
        arg = restful.inputs.boolean(arg)
        return arg

    @classmethod
    def boolTrue(cls, arg):
        """ Returns True by default if the string is empty"""
        return cls.bool(arg, True)

    @classmethod
    def boolFalse(cls, arg):
        """ Returns False by default if the string is empty"""
        return cls.bool(arg, False)

    @classmethod
    def tristate(cls, arg):
        """ Tristate argument, it is either True, False or both"""
        if str(active).lower() == 'both':
            return 'both'
        else:
            return cls.bool(arg, False)





