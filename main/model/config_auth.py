# coding: utf-8
"""Provides implementation of ConfigAuth"""
from __future__ import absolute_import

from google.appengine.ext import ndb
from pydash import _


class ConfigAuth(object):
    """A class describing datastore authentication properties."""
    auth_bitbucket_id = ndb.StringProperty(default='')
    auth_bitbucket_secret = ndb.StringProperty(default='')
    auth_bitbucket_icon = ndb.StringProperty(default='bitbucket')

    auth_dropbox_id = ndb.StringProperty(default='')
    auth_dropbox_secret = ndb.StringProperty(default='')
    auth_dropbox_icon = ndb.StringProperty(default='dropbox')

    auth_facebook_id = ndb.StringProperty(default='')
    auth_facebook_secret = ndb.StringProperty(default='')
    auth_facebook_icon = ndb.StringProperty(default='facebook')

    auth_github_id = ndb.StringProperty(default='')
    auth_github_secret = ndb.StringProperty(default='')
    auth_github_icon = ndb.StringProperty(default='github-circle')

    auth_instagram_id = ndb.StringProperty(default='')
    auth_instagram_secret = ndb.StringProperty(default='')
    auth_instagram_icon = ndb.StringProperty(default='instagram')

    auth_linkedin_id = ndb.StringProperty(default='')
    auth_linkedin_secret = ndb.StringProperty(default='')
    auth_linkedin_icon = ndb.StringProperty(default='linkedin')

    auth_microsoft_id = ndb.StringProperty(default='')
    auth_microsoft_secret = ndb.StringProperty(default='')
    auth_microsoft_icon = ndb.StringProperty(default='microsoft')

    auth_twitter_id = ndb.StringProperty(default='')
    auth_twitter_secret = ndb.StringProperty(default='')
    auth_twitter_icon = ndb.StringProperty(default='twitter')

    auth_vk_id = ndb.StringProperty(default='')
    auth_vk_secret = ndb.StringProperty(default='')
    auth_vk_icon = ndb.StringProperty(default='vk')

    auth_yahoo_id = ndb.StringProperty(default='')
    auth_yahoo_secret = ndb.StringProperty(default='')
    auth_yahoo_icon = ndb.StringProperty(default='account-box-outline') # yahoo is not available yet



    @classmethod
    def get_public_properties(cls):
        """Public properties are ones begining with 'auth_' and ending with '_id'"""
        return _.filter(set(dir(cls)), lambda x: x.startswith('auth_') and ( x.endswith('_id') or x.endswith('_icon')))
