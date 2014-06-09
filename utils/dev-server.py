import json
import os
import urllib

import cherrypy
import requests
from requests_oauthlib import OAuth1Session


_APP_NAME = 'json'
resource_owner_key = None
resource_owner_secret = None
_CLIENT_KEY = '7f7d7e289dbd4cf890f02990cb2b527c'
_CLIENT_SECRET = '91a5adb0ad1546a3844cda09738445d0'
_REQUEST_TOKEN_URL = 'http://api.fitbit.com/oauth/request_token'
_ACCESS_TOKEN_URL = 'http://api.fitbit.com/oauth/access_token'
_BASE_AUTHORIZE_URL = 'http://www.fitbit.com/oauth/authorize'
_THE_FILE = '/tmp/data.json'

def hello():
    pass

@cherrypy.tools.json_out()
def proxy(url_encoded):
    decoded_url = urllib.unquote(url_encoded)
    response = requests.get(decoded_url,
                            headers = {'Authorization' : cherrypy.request.headers['Authorization']})
    cherrypy.response.status = response.status_code
    return response.json()

@cherrypy.tools.json_out()
def login_with_fitbit(reply_to):
    global resource_owner_key
    global resource_owner_secret
    oauth = OAuth1Session(client_key = _CLIENT_KEY,
                          client_secret = _CLIENT_SECRET,
                          callback_uri = 'http://localhost:8080/callback/fitbit/%s' % reply_to)
    response = oauth.fetch_request_token(_REQUEST_TOKEN_URL)
    resource_owner_key = response.get('oauth_token')
    resource_owner_secret = response.get('oauth_token_secret')
    authorization_url = oauth.authorization_url(_BASE_AUTHORIZE_URL)
    response = {'redirect_to' : authorization_url}
    return response

def callback_fitbit(reply_to, oauth_token, oauth_verifier):
    oauth = OAuth1Session(client_key = _CLIENT_KEY,
                          client_secret = _CLIENT_SECRET,
                          resource_owner_key = resource_owner_key,
                          resource_owner_secret = resource_owner_secret,
                          verifier = oauth_verifier)
    response = oauth.fetch_access_token(_ACCESS_TOKEN_URL)
    real_access_token = response.get('oauth_token')
    real_access_secret = response.get('oauth_token_secret')
    raise cherrypy.HTTPRedirect('/index#/authenticated/%s?oauth_token=%s&oauth_token_secret=%s' % (reply_to, real_access_token,
                                                                                                  real_access_secret))

@cherrypy.tools.json_out()
def store_data():
    data = json.loads(cherrypy.request.body.read())
    with open(_THE_FILE, 'w') as f:
        json.dump(data, f)
    return {}

@cherrypy.tools.json_out()
def retrieve_data():
    with open(_THE_FILE, 'r') as f:
        the_data = json.load(f)
    return the_data

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(current_dir, _APP_NAME)
    d = cherrypy.dispatch.RoutesDispatcher()
    d.connect(name = "proxy", route = "/proxy", controller = proxy,
              conditions = dict(method = ["GET"]))
    d.connect(name = "fitbit-step1", route = "/connect/fitbit", controller = login_with_fitbit,
              conditions = dict(method = ["GET"]))
    d.connect(name = 'fitbit-step2', route = '/callback/fitbit/:reply_to', controller = callback_fitbit,
              conditions = dict(method = ['GET']))
    d.connect(name = 'fitbit-store', route = '/store', controller = store_data,
              conditions = dict(method = ['POST']))
    d.connect(name = 'fitbit-load', route = '/load', controller = retrieve_data,
              conditions = dict(method = ['GET']))
    d.connect(name = 'test', route = '/Hello', controller = hello,
              conditions = dict(method = ['POST']))
    cherrypy.config.update({'log.error_file': 'site.log',
                            'log.screen': True,
                            'server.thread_pool' : 20,})
                            #'server.ssl_module' : 'builtin',
                            #'server.ssl_certificate' : 'cert.pem',
                            #'server.ssl_private_key' : 'privkey.pem'})

    conf = {'/js': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'js'),
                      'tools.staticdir.content_types' : {'js' : 'text/javascript'}},
            '/css': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'css')},
            '/views': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'views')},
            '/assets': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'assets')},
            '/index' : {'tools.staticfile.on' : True,
                        'tools.staticfile.filename' : os.path.join(app_dir, 'index.html')},
            '/' : {'request.dispatch' : d}}
    cherrypy.tree.mount(root = None, config = conf)
    cherrypy.engine.start()
    cherrypy.engine.block()
